/**
 * Fileupload v1.0.0
 * (c) fwx426328
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    typeof define === 'function' && define.cmd ? define(factory) :
    (global.Fileupload = factory());
})(this, function () {
  'use strict';

  var version = '1.0.0';

  function isDef(v) {
    return v !== undefined && v !== null;
  };

  function isTrue(v) {
    return v === true;
  };

  function isObject(obj) {
    return obj !== null && typeof obj === 'object';
  };

  function isFunction(it) {
    return Object.prototype.toString.call(it) === '[object Function]';
  };

  function isString(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
  };

  function noop() {};

  function slice(it) {
    return [].slice.call(it);
  };

  function assert(condition, message) {
    if (!condition) {
      throw new Error(("Fileupload.js: " + message));
    }
  };


  function fileSlice(file, size) {
    var fileList = [];
    for (var i = 0, len = file.size / size; i < len; i++) {
      var start = i * size;
      var end = (i + 1) * size;
      var blob = file.slice(start, end);
      fileList.push({
        index: i,
        blob: blob
      });
    };
    return fileList;
  };

  function hasProp(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };

  function eachProp(obj, func) {
    var prop;
    for (prop in obj) {
      if (hasProp(obj, prop)) {
        if (func(obj[prop], prop)) {
          break;
        }
      }
    }
  };

  function mixin(target, source, force) {
    if (source) {
      eachProp(source, function (val, prop) {
        if (isTrue(force) || !hasProp(target, prop)) {
          target[prop] = val;
        };
      });
    };
    return target;
  };

  var ajaxSetting = {
    type: 'GET',
    dataType: 'json',
    data: {},
    processData: true
  };

  function ajax(options) {
    options = mixin(options, ajaxSetting);
    var params = options.data;
    if (options.processData) {
      params = formatParams(params);
    }
    var xhr = null;
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else {
      xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        var status = xhr.status;
        if (status >= 200 && status < 300) {
          options.success && options.success(xhr.responseText, xhr.responseXML);
        } else {
          options.error && options.error(status);
        }
      }
    }

    if (options.type == "GET") {
      xhr.open("GET", options.url + "?" + params, true);
      xhr.send(null);
    } else if (options.type == "POST") {
      xhr.open("POST", options.url, true);
      if (options.processData) {
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      }
      xhr.send(params);
    }
  };

  //格式化参数
  function formatParams(data) {
    var arr = [];
    for (var name in data) {
      arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
    }
    arr.push(("v=" + Math.random()).replace(".", ""));
    return arr.join("&");
  };


  function Fileupload() {

    var _fileList = [];

    var _currentSliceList = [];

    var _uploadFileUrl = '';

    var _queryFileUrl = '';

    var _mergeFileUrl = '';

    var _threadId = 0;

    var _currentFile = '';

    var _mergeFileList = [];

    var _successNum = 0;

    var _threadNum = 6;

    var _totalSize = 0;

    var _sliceSize = 4 * 1024 * 1024;

    var _fileSign = noop;

    var _cache = true;

    var _onMap = {
      'complete': noop,
      'query': noop,
      'merge': noop,
      'upload': noop,
      'success': noop,
      'progress': noop
    };

    var _isPause = false;

    function getMd5(file, fn) {
      var fileReader = new FileReader();
      try {
        fileReader.readAsArrayBuffer(file);
      } catch (e) {
        fn(e);
      };
      fileReader.onload = function (e) {
        var md5 = _fileSign(e.target.result);
        fn(md5);
      };
    };


    function startThread() {
      for (var i = 0; i < _threadNum; i++) {
        upload();
      };
    };

    function initFileSlice() {
      if (_fileList.length === 0) {
        return;
      };
      _currentFile = _fileList.pop();
      _currentSliceList = fileSlice(_currentFile, _sliceSize);
    };

    function mergeFile() {
      if (_mergeFileList.indexOf(_currentFile.name) > -1) {
        return;
      };
      _mergeFileList.push(_currentFile.name);
      ajax({
        url: _mergeFileUrl,
        type: 'POST',
        data: {
          filename: _currentFile.name
        },
        success: function (data) {
          _onMap.merge.call(this, data);
          _onMap.complete.call(this, _currentFile.name);
          if (_fileList.length > 0) {
            initFileSlice();
            startThread();
          } else {
            _onMap.success.call(this, null);
            _onMap.progress.call(this, 1);
          }
        },
        error: function (e) {
          _onMap.merge.call(this, e);
          console.error('[Fileupload mergeFile]' + e);
        }
      });
    };

    function queryFile(md5, fn) {
      if (_cache) {
        var isExistMd5 = window.localStorage.getItem(md5);
        if (isExistMd5 == md5) {
          var msg = {
            isExist: 1,
            message: '本地存在'
          };
          _onMap.query.call(this, msg);
          return fn(msg);
        };
      }
      ajax({
        url: _queryFileUrl,
        type: 'POST',
        dataType: "json",
        data: {
          id: md5,
          filename: _currentFile.name
        },
        success: function (data) {
          _onMap.query.call(this, data);
          fn(data);
        },
        error: function (e) {
          _onMap.query.call(this, e);
          console.error('[Fileupload queryFile]' + e);
        }
      });
    };

    function getProgress() {
      var progress = _threadId * _sliceSize  / _totalSize; 
      if (progress >= 0.99) {
        progress = 0.99;
      }
      return progress;
    };

    var uploadtimer = null;
    function upload() {
      if (_isPause) {
        clearTimeout(uploadtimer);
        uploadtimer = setTimeout(function() {
          console.log('暂停');
          startThread();
        }, 300);
        if (uploadtimer) {
          return;
        }
      } 

      _onMap.progress.call(this, getProgress());
      if (_currentSliceList.length == 0) {
        _successNum++;
        if (_successNum === _threadNum) {
          _successNum = 0;
          mergeFile();
        }
        return;
      };
      
      var temp = _currentSliceList.pop();
      (function (blobTemp) {
        getMd5(blobTemp.blob, function (md5) {
          queryFile(md5, function (data) {
            if (data.code == 0) {
              console.warn('请求错误');
            }
            if (data.isExist == 1) {
              _threadId++;
              upload();
            } else {
              var formData = new FormData();
              formData.append('file', blobTemp.blob);
              formData.append('filename', _currentFile.name);
              formData.append('index', blobTemp.index);
              formData.append('id', md5);
              ajax({
                url: _uploadFileUrl,
                type: 'POST',
                cache: false,
                data: formData,
                processData: false,
                contentType: false,
                success: function (data) {
                  _threadId++;
                  _onMap.upload.call(this, data);
                  upload();
                  _cache && window.localStorage.setItem(md5, md5);
                },
                error: function (e) {
                  _currentSliceList.push(blobTemp);
                  _onMap.upload.call(this, data);
                  upload();
                  console.log('[Fileupload upload fail, try again]');
                }
              });
            }
          });
        });
      })(temp);
    }

    this.set = function (option) {
      assert(isObject(option), 'set only accept object');
      assert(isString(option['upload']), 'set option\'s props \'upload\' must be string');
      assert(isString(option['query']), 'set option\'s props \'query\' must be string');
      assert(isString(option['merge']), 'set option\'s props \'merge\' must be string');
      assert(isFunction(option['fileSign']), 'set option\'s props \'merge\' must be function')
      _uploadFileUrl = option['upload'];
      _queryFileUrl = option['query'];
      _mergeFileUrl = option['merge'];
      _fileSign = option['fileSign'];
      _cache = isDef(option['cache']) ? Boolean(option['cache']) : _cache;
      _sliceSize = option['sliceSize'] || 4 * 1024 * 1024;
    };

    this.addFile = function (fileArr) {
      _fileList = slice(fileArr);
      _fileList.forEach(function (file) {
        _totalSize += file.size;
      });
    };

    this.upload = function () {
      initFileSlice();
      startThread();
    };

    this.on = function (type, fn) {
      if (isFunction(fn)) {
        _onMap[type] = fn;
      }
      if (isObject(type)) {
        _onMap = mixin(type, _onMap);
      }
    };

    this.setPause = function(pause) {
      _isPause = Boolean(pause);
    }
  };

  Fileupload.prototype.version = version;

  return Fileupload;

});