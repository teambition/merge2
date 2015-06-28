'use strict'
/*global describe, it*/

var should = require('should')
var merge2 = require('../index.js')
var stream = require('stream')
var thunk = require('thunks')()
var through = require('through2')

function fakeReadStream (options) {
  var readStream = new stream.Readable(options)
  readStream._read = function () {}
  return readStream
}

describe('merge2', function () {
  it('merge2(read1, read2, through3)', function (done) {
    var options = {objectMode: true}
    var result = []
    var read1 = fakeReadStream(options)
    var read2 = fakeReadStream(options)
    var through3 = through.obj()

    var mergeStream = merge2(read1, read2, through3)

    read1.push(1)
    thunk.delay(100)(function () {
      read1.push(2)
      read1.push(null)
    })
    read2.push(3)
    thunk.delay(10)(function () {
      read2.push(4)
      read2.push(null)
    })
    through3.push(5)
    thunk.delay(200)(function () {
      through3.push(6)
      through3.end()
    })

    mergeStream
      .on('data', function (chunk) {
        result.push(chunk)
      })
      .on('error', done)
      .on('end', function () {
        should(result).be.eql([1, 2, 3, 4, 5, 6])
        done()
      })
  })

  it('merge2(read1, [read2, through3], through4, [through5, read6])', function (done) {
    var options = {objectMode: true}
    var result = []
    var read1 = fakeReadStream(options)
    var read2 = fakeReadStream(options)
    var through3 = through.obj()
    var through4 = through.obj()
    var through5 = through.obj()
    var read6 = fakeReadStream(options)

    read1.push(1)
    read1.push(null)
    thunk.delay(100)(function () {
      read2.push(2)
      read2.push(null)
    })
    through3.push(3)
    through3.end()
    through4.push(4)
    through4.push(null)
    through5.push(5)
    through5.push(null)
    thunk.delay(200)(function () {
      read6.push(6)
      read6.push(null)
    })

    var mergeStream = merge2(read1, [read2, through3], through4, [through5, read6])

    mergeStream
      .on('data', function (chunk) {
        result.push(chunk)
      })
      .on('error', done)
      .on('end', function () {
        should(result).be.eql([1, 3, 2, 4, 5, 6])
        done()
      })
  })

  it('merge2().add(read1, [read2, through3], through4, [through5, read6])', function (done) {
    var options = {objectMode: true}
    var result = []
    var read1 = fakeReadStream(options)
    var read2 = fakeReadStream(options)
    var through3 = through.obj()
    var through4 = through.obj()
    var through5 = through.obj()
    var read6 = fakeReadStream(options)
    var mergeStream = merge2()

    read1.push(1)
    read1.push(null)
    thunk.delay(100)(function () {
      read2.push(2)
      read2.push(null)
    })
    through3.push(3)
    through3.end()
    through4.push(4)
    through4.push(null)
    through5.push(5)
    through5.push(null)
    thunk.delay(200)(function () {
      read6.push(6)
      read6.push(null)
    })

    mergeStream
      .add(read1, [read2, through3], through4)
      .on('data', function (chunk) {
        result.push(chunk)
      })
      .add([through5, read6])
      .on('error', done)
      .on('end', function () {
        should(result).be.eql([1, 3, 2, 4, 5, 6])
        done()
      })
  })

  it('merge2(read1, read2, through3, {objectMode: false})', function (done) {
    var options = {objectMode: false}
    var result = ''
    var read1 = fakeReadStream(options)
    var read2 = fakeReadStream(options)
    var through3 = through(options)

    var mergeStream = merge2(read1, read2, through3, options)

    read1.push('1')
    thunk.delay(100)(function () {
      read1.push('2')
      read1.push(null)
    })
    read2.push('3')
    thunk.delay(10)(function () {
      read2.push('4')
      read2.push(null)
    })
    through3.push('5')
    thunk.delay(200)(function () {
      through3.push('6')
      through3.end()
    })

    mergeStream
      .on('data', function (chunk) {
        result += chunk.toString()
      })
      .on('error', done)
      .on('end', function () {
        should(result).be.equal('123456')
        done()
      })
  })

  it('merge2(read1, read2, {end: false})', function (done) {
    var options = {objectMode: true}
    var result = []
    var read1 = fakeReadStream(options)
    var read2 = fakeReadStream(options)
    var through3 = through.obj()

    var mergeStream = merge2(read1, read2, {end: false})

    read1.push(1)
    read1.push(2)
    read1.push(null)
    read2.push(3)
    read2.push(4)
    read2.push(null)
    through3.push(5)
    through3.push(6)
    through3.end()

    thunk.delay(500)(function () {
      should(result).be.eql([1, 2, 3, 4])
      mergeStream.add(through3)
      return thunk.delay(100)
    })(function () {
      mergeStream.end()
    })

    mergeStream
      .on('data', function (chunk) {
        result.push(chunk)
      })
      .on('error', done)
      .on('end', function () {
        should(result).be.eql([1, 2, 3, 4, 5, 6])
        done()
      })
  })

  it('merge2(merge2(through4, [through5, read6]), read1, [read2, through3])', function (done) {
    var options = {objectMode: true}
    var result1 = []
    var result2 = []
    var read1 = fakeReadStream(options)
    var read2 = fakeReadStream(options)
    var through3 = through.obj()
    var through4 = through.obj()
    var through5 = through.obj()
    var read6 = fakeReadStream(options)

    read1.push(1)
    read1.push(null)
    thunk.delay(100)(function () {
      read2.push(2)
      read2.push(null)
    })
    through3.push(3)
    through3.end()
    through4.push(4)
    through4.push(null)
    through5.push(5)
    through5.push(null)
    thunk.delay(10)(function () {
      read6.push(6)
      read6.push(null)
    })

    var mergeStream1 = merge2(through4, [through5, read6])

    mergeStream1.on('data', function (chunk) {
      result1.push(chunk)
    })

    var mergeStream = merge2(mergeStream1, read1, [read2, through3])

    mergeStream
      .on('data', function (chunk) {
        result2.push(chunk)
        if (result2.length <= 3) should(result1).be.eql(result2)
        else should(result1).be.eql([4, 5, 6])
      })
      .on('error', done)
      .on('end', function () {
        should(result2).be.eql([4, 5, 6, 1, 3, 2])
        done()
      })
  })

})
