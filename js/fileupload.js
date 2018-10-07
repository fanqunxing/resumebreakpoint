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

function slice(it) {
  return [].slice.call(it);
};

function Fileupload () {
  
  var _fileList = [];

  this.addFile = function (fileArr) {
  	_fileList = slice(fileArr);
  };
};

Fileupload.prototype.version = version;

return Fileupload;

});