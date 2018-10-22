/**
  * Fileupload v1.0.0
  * (c) fwx426328
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  typeof define === 'function' && define.cmd ? define(factory) :
  (global.Fileupload = factory());
})(this, function () { 'use strict';

var version = '1.0.0';

var _fileSign_ = null;

function isDef(v) {
  return v !== undefined && v !== null;
};

function isObject (obj) {
  return obj !== null && typeof obj === 'object';
};

function isFunction(it) {
  return Object.prototype.toString.call(it) === '[object Function]';
};

function isString (obj){
  return Object.prototype.toString.call(obj) === '[object String]';
}

function noop() {};

function slice (it) {
  return [].slice.call(it);
};

function assert (condition, message) {
  if (!condition) {
    throw new Error(("Fileupload.js: " + message));
  }
};

/**
 * 简单Promise
 */
function Promise (fn) {
  this.status = 'pending';
  var _success = function () {};
  var _error = function () {};
  var _value = null;
  var _self = this;
  function resolve(value) {
    _self.status = 'fulfilled';
    _value = value;
    setTimeout(function() {
      _success(value);
    }, 0);
  };
  function reject(value) {
    _self.status = 'rejected';
    _value = value;
    setTimeout(function() {
      _error(value);
    }, 0);
  };
  this.then = function (success) {
    if (_self.status == 'pending') {
      _success = success;
    } else {
      success(_value);
    };
    return _self;
  };
  this.catch = function (error) {
    if (_self.status == 'pending') {
      _error = error;
    } else {
      error(_value);
    };
    return _self;
  }; 
  fn(resolve, reject);
}

function getMd5 (file) {
  return new Promise(function (resolve, reject) {
    var fileReader = new FileReader();
    try {
      fileReader.readAsArrayBuffer(file);
    } catch (e) {
      reject(e);
    };
    fileReader.onload = function (e) {
      var md5 = _fileSign_(e.target.result);
      resolve(md5);
    };
  });
};

function fileSlice (file, size) {
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

function fileListSlice (fileList, size) {
  var fileSliceList = [];
  fileList.forEach(function(file) {
    var filebloblist = fileSlice(file, size);
    fileSliceList.push(filebloblist);
  });
  return fileSliceList;
};


function ajax(options) {
    options = options || {};
    options.type = (options.type || "GET").toUpperCase();
    options.dataType = options.dataType || "json";
    var params = formatParams(options.data);

    if (window.XMLHttpRequest) {
        var xhr = new XMLHttpRequest();
    } else {
        var xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var status = xhr.status;
            if (status >= 200 && status < 300) {
                options.success && options.success(xhr.responseText, xhr.responseXML);
            } else {
                options.fail && options.fail(status);
            }
        }
    }

    if (options.type == "GET") {
        xhr.open("GET", options.url + "?" + params, true);
        xhr.send(null);
    } else if (options.type == "POST") {
        xhr.open("POST", options.url, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(params);
    }
}

//格式化参数
function formatParams(data) {
    var arr = [];
    for (var name in data) {
        arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
    }
    arr.push(("v=" + Math.random()).replace(".",""));
    return arr.join("&");
}



Fileupload.fileSign = function(fileSign) {
  _fileSign_ = fileSign;
};

function Fileupload () {
  
  var _fileList = [];

  var _currentSliceList = [];

  var _uploadFileUrl = '';

  var _queryFileUrl = '';

  var _mergeFileUrl = '';

  var _sparkmd5 = '';

  var _threadId = 0;

  var _currentFile = '';

  var _status = '';

  var _mergeFileList = [];

  var _successNum = 0;

  var _threadNum = 6;

  var _progressFn = noop;

  var _completeFn = noop;

  var _totalNum = 0;

  function startThread(num) {
  	_status = 'start';
  	for (var i = 0; i < num; i ++) {
  		upload();
  	};
  }

  function initFileSlice() {
  	if (_fileList.length === 0) {
  		_status = 'finsh';
  		return ;
  	};
  	_currentFile = _fileList.pop();
  	console.log(_currentFile)
  	_currentSliceList = fileSlice(_currentFile, 1024*1024*4);
    _totalNum = _currentSliceList.length;
  };

  function mergeFile() {
    if (_mergeFileList.indexOf(_currentFile.name) > -1) {
      return;
    };
    _mergeFileList.push(_currentFile.name);
  	$.ajax({
  		url: _mergeFileUrl,
  		type: 'POST',
  		data: {
  			name: _currentFile.name
  		},
  		success : function(data) {
        console.log(_currentFile.name + '合并成功');
        _completeFn(_currentFile.name);
  		},
  		error: function (e) {
  		
  		}
  	});
  };

  function queryFile(md5, fn) {
    $.ajax({
      url: _queryFileUrl,
      type: 'POST',
      data: {
        md5: md5
      },
      success : function(data) {
        fn(data);
      },
      error: function (e) {
      
      }
    });
  };
  
  function upload() {
  	_status = 'running';
  	_threadId++;
  	console.log('线程' + _threadId + '开始');

     var progress = 1- (_currentSliceList.length / _totalNum);
    _progressFn.call(this, progress);
  	// 完成
  	if (_currentSliceList.length == 0) {
      _successNum++;
      if (_successNum === _threadNum) {
        mergeFile();
      }
      return;
  	};

  	var temp = _currentSliceList.pop();
  	var formData = new FormData();
  	formData.append('file', temp.blob);
    (function(blobTemp) {
      getMd5(blobTemp.blob).then(function(md5) {
        queryFile(md5, function(data) {
          if (data == 1) {
            console.log('相同');
            upload();
          } else {
            formData.append('filename', _currentFile.name + '-' + blobTemp.index + '-' + md5);
            $.ajax({
              url: _uploadFileUrl,
              type: 'POST',
              cache: false,
              data: formData,
              processData: false,
              contentType: false,
              success: function(data) {
                console.log('线程' + _threadId + '成功');
                upload();
              },
              error: function(e) {
                _currentSliceList.push(blobTemp);
                console.log('线程' + _threadId + '失败');
                upload();
              }
            });
          }
        });
      });
    })(temp);
  }

  this.init = function (option) {
    assert(isObject(option), 'init only accept object');
    assert(isString(option['upload']), 'init option\'s props \'upload\' must be string');
    assert(isString(option['query']), 'init option\'s props \'query\' must be string');
    assert(isString(option['merge']), 'init option\'s props \'merge\' must be string');
    assert(isFunction(option['progress']), 'init option\'s props \'progress\' must be function');
    _uploadFileUrl = option['upload'];
    _queryFileUrl = option['query'];
    _mergeFileUrl = option['merge'];
    _progressFn = option['progress'];
    _completeFn = option['complete'];
  };

  this.addFile = function (fileArr) {
    _fileList = slice(fileArr);
  };

  this.upload = function () {
  	initFileSlice();
    startThread(_threadNum);
  };
};

Fileupload.prototype.version = version;

return Fileupload;

});