'use strict'

const tman = require('tman')
const assert = require('node:assert')
const Stream = require('node:stream')
const thunk = require('thunks').thunk
const through = require('through2')
const toThrough = require('to-through')

test(require('..'))

function test (merge2) {
  tman.suite('merge2', function () {
    tman.it('merge2(read1, read2, through3)', function (done) {
      const options = { objectMode: true }
      const result = []
      const read1 = fakeReadStream(options)
      const read2 = fakeReadStream(options)
      const through3 = through.obj()

      const mergeStream = merge2(read1, read2, through3)

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
          assert.deepStrictEqual(result, [1, 2, 3, 4, 5, 6])
          done()
        })
    })

    tman.it('merge2 - error handling', function (done) {
      const ts = through.obj()

      const mergeStream = merge2(toThrough(ts), { pipeError: true })

      const expectedError = new Error('error')
      thunk.delay(100)(function () {
        ts.destroy(expectedError)
      })

      mergeStream
        .on('error', function (error) {
          assert.strictEqual(error, expectedError)
          done()
        })
        .on('end', function () {
          throw Error('error expected')
        })
    })

    tman.it('merge2(TransformStream)', function (done) {
      const result = []
      const ts = through.obj()

      const mergeStream = merge2(toThrough(ts))

      ts.push(1)
      thunk.delay(100)(function () {
        ts.push(2)
        ts.push(null)
      })

      mergeStream
        .on('data', function (chunk) {
          result.push(chunk)
        })
        .on('error', done)
        .on('end', function () {
          assert.deepStrictEqual(result, [1, 2])
          done()
        })
    })

    tman.it('merge2(read1, [read2, through3], through4, [through5, read6])', function (done) {
      const options = { objectMode: true }
      const result = []
      const read1 = fakeReadStream(options)
      const read2 = fakeReadStream(options)
      const through3 = through.obj()
      const through4 = through.obj()
      const through5 = through.obj()
      const read6 = fakeReadStream(options)

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

      const mergeStream = merge2(read1, [read2, through3], through4, [through5, read6])

      mergeStream
        .on('data', function (chunk) {
          result.push(chunk)
        })
        .on('error', done)
        .on('end', function () {
          assert.deepStrictEqual(result, [1, 3, 2, 4, 5, 6])
          done()
        })
    })

    tman.it('merge2().add(read1, [read2, through3], through4, [through5, read6])', function (done) {
      const options = { objectMode: true }
      const result = []
      const read1 = fakeReadStream(options)
      const read2 = fakeReadStream(options)
      const through3 = through.obj()
      const through4 = through.obj()
      const through5 = through.obj()
      const read6 = fakeReadStream(options)
      const mergeStream = merge2()

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
          assert.deepStrictEqual(result, [1, 3, 2, 4, 5, 6])
          done()
        })
    })

    tman.it('merge2(read1, read2, through3, {objectMode: false})', function (done) {
      const options = { objectMode: false }
      let result = ''
      const read1 = fakeReadStream(options)
      const read2 = fakeReadStream(options)
      const through3 = through(options)

      const mergeStream = merge2(read1, read2, through3, options)

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
          assert.strictEqual(result, '123456')
          done()
        })
    })

    tman.it('merge2([read1, read2]) with classic style streams', function (done) {
      const result = []
      const read1 = fakeReadClassicStream()
      const read2 = fakeReadClassicStream()

      const mergeStream = merge2([read1, read2])

      read1.push(1)
      read1.push(null)
      thunk.delay(100)(function () {
        read2.push(2)
        read2.push(null)
      })

      mergeStream
        .on('data', function (chunk) {
          result.push(chunk)
        })
        .on('error', done)
        .on('end', function () {
          assert.deepStrictEqual(result, [1, 2])
          done()
        })
    })

    tman.it('merge2(read1, read2, {end: false})', function (done) {
      const options = { objectMode: true }
      const result = []
      const read1 = fakeReadStream(options)
      const read2 = fakeReadStream(options)
      const through3 = through.obj()

      const mergeStream = merge2(read1, read2, { end: false })

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
        assert.deepStrictEqual(result, [1, 2, 3, 4])
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
          assert.deepStrictEqual(result, [1, 2, 3, 4, 5, 6])
          done()
        })
    })

    tman.it('merge2(merge2(through4, [through5, read6]), read1, [read2, through3])', function (done) {
      const options = { objectMode: true }
      const result1 = []
      const result2 = []
      const read1 = fakeReadStream(options)
      const read2 = fakeReadStream(options)
      const through3 = through.obj()
      const through4 = through.obj()
      const through5 = through.obj()
      const read6 = fakeReadStream(options)

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

      const mergeStream1 = merge2(through4, [through5, read6])

      mergeStream1.on('data', function (chunk) {
        result1.push(chunk)
      })

      const mergeStream = merge2(mergeStream1, read1, [read2, through3])

      mergeStream
        .on('data', function (chunk) {
          result2.push(chunk)
          if (result2.length <= 3) assert.deepStrictEqual(result1, result2)
          else assert.deepStrictEqual(result1, [4, 5, 6])
        })
        .on('error', done)
        .on('end', function () {
          assert.deepStrictEqual(result2, [4, 5, 6, 1, 3, 2])
          done()
        })
    })
  })
}

function fakeReadStream (options) {
  const readStream = new Stream.Readable(options)
  readStream._read = function () {}
  return readStream
}

function fakeReadClassicStream () {
  const readStream = new Stream()
  readStream.readable = true
  readStream.push = function (data) {
    if (data === null) {
      this.emit('end')
      readStream.readable = false
    }
    this.emit('data', data)
  }
  return readStream
}
