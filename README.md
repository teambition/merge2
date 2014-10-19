merge2 v0.2.1 [![Build Status](https://travis-ci.org/teambition/merge2.svg)](https://travis-ci.org/teambition/merge2)
====
> Merge multiple streams into one stream in sequence or parallel.

## Install

Install with [npm](https://npmjs.org/package/merge2)

```
npm install merge2
```


## Usage

```js
var gulp = require('gulp'),
  merge2 = require('merge2'),
  concat = require('gulp-concat'),
  minifyHtml = require('gulp-minify-html'),
  ngtemplate = require('gulp-ngtemplate');

gulp.task('app-js', function () {
  return merge2(
      gulp.src('static/src/tpl/*.html')
        .pipe(minifyHtml({empty: true}))
        .pipe(ngtemplate({
          module: 'genTemplates',
          standalone: true
        })
      ), gulp.src([
        'static/src/js/app.js',
        'static/src/js/locale_zh-cn.js',
        'static/src/js/router.js',
        'static/src/js/tools.js',
        'static/src/js/services.js',
        'static/src/js/filters.js',
        'static/src/js/directives.js',
        'static/src/js/controllers.js'
      ])
    )
    .pipe(concat('app.js'))
    .pipe(gulp.dest('static/dist/js/'));
});
```

## API

```js
var merge2 = require('merge2');
```

### merge2()
### merge2(options)
### merge2(stream1, stream2, ..., streamN)
### merge2(stream1, stream2, ..., streamN, options)
### merge2(stream1, [stream2, stream3, ...], streamN, options)
return a duplex stream (outStream).

### outStream.add(stream)
### outStream.add(stream1, [stream2, stream3, ...], ...)
return the outStream.

## License

MIT © [Teambition](http://teambition.com)
