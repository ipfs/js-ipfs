'use strict'

const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const runSequence = require('run-sequence')
const semver = require('semver')
const fs = require('fs')
const exec = require('child_process').exec

function getCurrentVersion () {
  return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version
}

function npmPublish (done) {
  exec('npm publish', (err, stdout, stderr) => {
    if (err) throw err
    $.util.log('Published to npm')
  })
}

function fail (msg) {
  $.util.log($.util.colors.red(msg))
  process.exit(1)
}

function getType () {
  if ($.util.env.major) return 'major'
  if ($.util.env.minor) return 'minor'

  return 'patch'
}

gulp.task('release:build', ['build'], () => {
  return gulp.src('./dist')
    .pipe($.git.add())
    .pipe($.git.commit('chore: build', {args: '-n'}))
})

gulp.task('release:bump', () => {
  const type = getType()
  const newVersion = semver.inc(getCurrentVersion(), type)

  return gulp.src('./package.json')
    .pipe($.bump({version: newVersion}))
    .pipe(gulp.dest('./'))
    .pipe($.git.add())
    .pipe($.git.commit(`chore: release version v${newVersion}`, {args: '-n'}))
    .pipe($.filter('package.json'))
    .pipe($.tagVersion())
})

gulp.task('release:push', done => {
  const remote = $.util.remote || 'origin'

  $.git.push(remote, 'master', {args: '--tags'}, err => {
    if (err) return fail(err.message)

    $.util.log(`Pushed to git ${remote}:master`)
    done()
  })
})

gulp.task('release:publish', done => {
  $.git.status({args: '-s'}, (err, stdout) => {
    if (err) return fail(err.message)

    const isDirty = stdout.trim().length > 0

    if (isDirty) {
      return fail('Dirt workspace, cannot push to npm')
    }

    npmPublish(done)
  })
})

gulp.task('release', done => {
  runSequence(
    'lint',
    'test',
    'release:build',
    'release:bump',
    'release:push',
    'release:publish',
    done
  )
})
