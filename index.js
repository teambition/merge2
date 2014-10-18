'use strict';
/*
 * gulp-merge
 * https://github.com/teambition/gulp-merge
 *
 * Copyright (c) 2014 Yan Qing
 * Licensed under the MIT license.
 */

var through = require('through2');
var slice = Array.prototype.slice;

module.exports = function () {
  var streams = [];
  var merging = false;
  var outStream  = through.obj();

  function addStream(stream) {
    if (Array.isArray(stream)) {
      stream.forEach(addStream);
      return this;
    }
    streams.push(stream);
    mergeStream();
    return this;
  }

  function mergeStream () {
    if (merging) return;
    merging = true;
    var stream = streams.shift();
    if (!stream) return endStream();

    stream.once('end', function () {
      merging = false;
      mergeStream();
    });
    stream.pipe(outStream, {end: false});
  }

  function endStream () {
    merging = false;
    if (outStream.readable) outStream.emit('end');
  }

  outStream.setMaxListeners(0);
  outStream.add = addStream;
  outStream.on('unpipe', function (stream) {
    var index = streams.indexOf(stream);
    if (index >= 0) streams.splice(index, 1);
    if (!streams.length) endStream();
  });

  addStream(slice.call(arguments));
  return outStream;
};
