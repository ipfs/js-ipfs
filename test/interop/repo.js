/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const waterfall = require('async/waterfall')
const bl = require('bl')
const crypto = require('crypto')
const os = require('os')

const GoDaemon = require('./daemons/go')
const JsDaemon = require('./daemons/js')

function catAndCheck (daemon, hash, data, callback) {
  waterfall([
    (cb) => daemon.api.cat(hash, cb),
    (stream, cb) => stream.pipe(bl(cb))
  ], (err, file) => {
    console.log('got file')
    expect(err).to.not.exist()
    expect(file).to.be.eql(data)
    callback()
  })
}

describe('repo', () => {
  it('read repo: go -> js', (done) => {
    const dir = os.tmpdir() + '/' + Math.ceil(Math.random() * 10000)
    const data = crypto.randomBytes(1024 * 5)

    const goDaemon = new GoDaemon({
      init: true,
      disposable: false,
      path: dir
    })
    let jsDaemon

    let hash
    waterfall([
      (cb) => goDaemon.start(cb),
      (cb) => goDaemon.api.add(data, cb),
      (res, cb) => {
        hash = res[0].hash
        catAndCheck(goDaemon, hash, data, cb)
      },
      (cb) => goDaemon.stop(cb),
      (cb) => {
        jsDaemon = new JsDaemon({
          init: false,
          disposable: false,
          path: dir
        })
        jsDaemon.start(cb)
      },
      (cb) => catAndCheck(goDaemon, hash, data, cb),
      (cb) => jsDaemon.stop(cb)
    ], done)
  })

  it('read repo: js -> go', (done) => {
    const dir = os.tmpdir() + '/' + Math.ceil(Math.random() * 10000)
    const data = crypto.randomBytes(1024 * 5)

    const jsDaemon = new JsDaemon({init: true, disposable: false, path: dir})
    let goDaemon

    let hash
    waterfall([
      (cb) => jsDaemon.start(cb),
      (cb) => jsDaemon.api.add(data, cb),
      (res, cb) => {
        hash = res[0].hash
        catAndCheck(jsDaemon, hash, data, cb)
      },
      (cb) => jsDaemon.stop(cb),
      (cb) => {
        goDaemon = new GoDaemon({init: false, disposable: false, path: dir})
        goDaemon.start(cb)
      },
      (cb) => catAndCheck(goDaemon, hash, data, cb),
      (cb) => goDaemon.stop(cb)
    ], done)
  })
})
