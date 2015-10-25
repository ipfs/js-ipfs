var gulp = require('gulp')
// var Server = require('karma').Server;
var mocha = require('gulp-mocha')

gulp.task('default', function () {
  gulp.start('test:node')
})

gulp.task('test:node', function (done) {
  // gulp.start('start-disposable-daemons')
  gulp.src('test/tests.js')
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(mocha())
    .once('error', function () {
      process.exit(1)
    })
    .once('end', function () {
      // gulp.start('stop-disposable-daemons')
      process.exit()
    })
})

/*
gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});
*/
