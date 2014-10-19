'use strict';
/*
 * merge2
 * https://github.com/teambition/merge2
 *
 * Copyright (c) 2014 Yan Qing
 * Licensed under the MIT license.
 */

var through = require('through2');
var slice = Array.prototype.slice;

module.exports = function () {
  var streamsQueue = [];
  var merging = false;
  var args = slice.call(arguments);
  var options = args[args.length - 1];

  if (options && !Array.isArray(options) && typeof options.addListener !== 'function') args.pop();
  else options = {};

  var doEnd = options.end !== false;
  if (options.objectMode == null) options.objectMode = true;
  if (options.highWaterMark == null) options.highWaterMark = 16;
  var mergedStream  = through(options);


  function addStream() {
    streamsQueue.push.apply(streamsQueue, arguments);
    mergeStream();
    return this;
  }

  function mergeStream() {
    if (merging) return;
    merging = true;

    var streams = streamsQueue.shift();
    if (!streams) return endStream();
    if (!Array.isArray(streams)) streams = [streams];

    var pipesCount = streams.length + 1;

    function next() {
      if (--pipesCount > 0) return;
      merging = false;
      mergeStream();
    }

    function pipe(stream) {
      function onend() {
        stream.removeListener('merge2UnpipeEnd', onend);
        stream.removeListener('end', onend);
        next();
      }
      stream.on('merge2UnpipeEnd', onend);
      stream.on('end', onend);
      stream.pipe(mergedStream, {end: false});
    }

    for (var i = 0; i < streams.length; i++) pipe(streams[i]);

    next();
  }

  function endStream() {
    merging = false;
    return doEnd && mergedStream.end();
  }

  mergedStream.setMaxListeners(0);
  mergedStream.add = addStream;
  mergedStream.on('unpipe', function (stream) {
    stream.emit('merge2UnpipeEnd');
  });

  if (args.length) addStream.apply(null, args);
  return mergedStream;
};
