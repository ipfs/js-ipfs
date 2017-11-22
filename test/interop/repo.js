/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const waterfall = require('async/waterfall')
const crypto = require('crypto')
const os = require('os')

const GoDaemon = require('../utils/interop-daemon-spawner/go')
const JsDaemon = require('../utils/interop-daemon-spawner/js')

function catAndCheck (daemon, hash, data, callback) {
  daemon.api.cat(hash, (err, fileData) => {
    expect(err).to.not.exist()
    expect(fileData).to.eql(data)
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

  // This was last due to an update on go-ipfs that changed how datastore is
  // configured
  it.skip('read repo: js -> go', (done) => {
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
