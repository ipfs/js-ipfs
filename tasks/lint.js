var gulp = require('gulp')
var $ = require('gulp-load-plugins')()

gulp.task('lint', function () {
  return gulp.src([
    '*.js',
    'test/**/*.js',
    'src/**/*.js',
    'tasks/**/*.js'
  ])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError())
})
