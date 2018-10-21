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

function isDef(v) {
  return v !== undefined && v !== null;
};

function isObject (obj) {
  return obj !== null && typeof obj === 'object';
};

function isString (obj){
  return Object.prototype.toString.call(obj) === '[object String]';
}

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

function httpPost (url, file) {
  var formData = new FormData();
  formData.append('file', file);
  return new Promise(function(resolve, reject) {
	  $.ajax({
		url: url,
		type: 'POST',
		cache: false,
		data: formData,
		processData: false,
        contentType: false,
		success : function(data) {
		  resolve(data);
		},
		error: function (e) {
		  reject(e);
		}
	  });
  });
};

function getMd5 (file) {
  return new Promise(function (resolve, reject) {
    var fileReader = new FileReader();
    try {
      fileReader.readAsArrayBuffer(file);
    } catch (e) {
      reject(e);
    };
    fileReader.onload = function (e) {
      var md5 = SparkMD5.ArrayBuffer.hash(e.target.result);
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
  };

  function mergeFile() {
  	$.ajax({
  		url: _mergeFileUrl,
  		type: 'POST',
  		data: {
  			name: _currentFile.name
  		},
  		success : function(data) {
        console.log(_currentFile.name + '合并成功');
  		},
  		error: function (e) {
  		
  		}
  	});
  };

  
  function upload() {
  	_status = 'running';
  	_threadId++;
  	console.log('线程' + _threadId + '开始');

  	// 完成
  	if (_currentSliceList.length == 0) {
      mergeFile();
  		initFileSlice();
  	};

  	if (_status === 'finsh') {
  		return;
  	}

  	var temp = _currentSliceList.pop();
  	var formData = new FormData();
  	formData.append('file', temp.blob);
    (function(blobTemp) {
      getMd5(blobTemp.blob).then(function(md5) {
        formData.append('md5', _currentFile.name + blobTemp.index + '-' + md5);
        $.ajax({
          url: _uploadFileUrl,
          type: 'POST',
          cache: false,
          data: formData,
          processData: false,
          contentType: false,
          success : function(data) {
            console.log('线程' + _threadId + '结束');
            upload();
          },
          error: function (e) {
            _currentSliceList.push(blobTemp);
            console.log('线程' + _threadId + '结束');
            upload();
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
    assert(isDef(option['md5']), 'init option\'s props \'merge\' must be has');
    _uploadFileUrl = option['upload'];
    _queryFileUrl = option['query'];
    _mergeFileUrl = option['merge'];
  };

  this.addFile = function (fileArr) {
    _fileList = slice(fileArr);
  };

  this.upload = function () {
  	initFileSlice();
    startThread(3);
  };
};

Fileupload.prototype.version = version;

return Fileupload;

});