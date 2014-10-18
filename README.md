gulp-merge v0.1.0 [![Build Status](https://travis-ci.org/teambition/gulp-merge.svg)](https://travis-ci.org/teambition/gulp-merge)
====
> Merge multiple streams into one stream in order.

## Install

Install with [npm](https://npmjs.org/package/gulp-merge)

```
npm install --save-dev gulp-sequence
```


## Usage

```js
var gulp = require('gulp'),
  gulpMerge = require('gulp-merge'),
  concat = require('gulp-concat'),
  minifyHtml = require('gulp-minify-html'),
  ngtemplate = require('gulp-ngtemplate');

gulp.task('app-js', function () {
  return gulpMerge(
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
var gulpMerge = require('gulp-merge');
```

### gulpMerge(stream1, stream2)
return a duplex stream (outStream).

### outStream.add(stream1, stream2)
return outStream(duplex stream).

## License

MIT © [Teambition](http://teambition.com)
