var browserify = require('browserify')
var gulp = require('gulp')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var runSequence = require('run-sequence')
var rimraf = require('rimraf')
var $ = require('gulp-load-plugins')()

function getBrowserify () {
  return browserify({
    entries: ['./src/index.js'],
    debug: true
  })
    .transform('brfs')
    .transform('babelify', {presets: ['es2015']})
}

gulp.task('clean', function (done) {
  rimraf('./dist', done)
})

gulp.task('build:nonminified', function () {
  return getBrowserify().bundle()
    .pipe(source('./ipfsapi.js'))
    .pipe(buffer())
    .pipe($.size())
    .pipe(gulp.dest('./dist/'))
})

gulp.task('build:minified', function () {
  return getBrowserify().bundle()
    .pipe(source('./ipfsapi.min.js'))
    .pipe(buffer())
    .pipe($.sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe($.uglify())
        .on('error', $.util.log)
    .pipe($.sourcemaps.write('./'))
    .pipe($.size({showFiles: true}))
    .pipe(gulp.dest('./dist/'))
})

gulp.task('build', ['clean'], function (done) {
  runSequence(
    'build:nonminified',
    'build:minified',
    done
  )
})
