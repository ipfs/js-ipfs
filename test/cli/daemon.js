/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const clean = require('../utils/clean')
const ipfsCmd = require('../utils/ipfs-exec')
const isWindows = require('../utils/platforms').isWindows
const os = require('os')
const path = require('path')
const hat = require('hat')
const fs = require('fs')

const skipOnWindows = isWindows() ? it.skip : it

const checkLock = (repo, cb) => {
  // skip on windows
  // https://github.com/ipfs/js-ipfsd-ctl/pull/155#issuecomment-326983530
  if (!isWindows) {
    if (fs.existsSync(path.join(repo, 'repo.lock'))) {
      cb(new Error('repo.lock not removed'))
    }
    if (fs.existsSync(path.join(repo, 'api'))) {
      cb(new Error('api file not removed'))
    }
  }
  cb()
}

function testSignal (ipfs, sig) {
  return ipfs('init').then(() => {
    return ipfs('config', 'Addresses', JSON.stringify({
      API: '/ip4/127.0.0.1/tcp/0',
      Gateway: '/ip4/127.0.0.1/tcp/0'
    }), '--json')
  }).then(() => {
    const proc = ipfs('daemon')
    return new Promise((resolve, reject) => {
      proc.stdout.on('data', (data) => {
        if (data.toString().includes(`Daemon is ready`)) {
          if (proc.kill(sig)) {
            resolve()
          } else {
            reject(new Error(`Unable to ${sig} process`))
          }
        }
      })
      proc.stderr.on('data', (data) => {
        if (data.toString().length > 0) {
          reject(new Error(data))
        }
      })
    })
  })
}

describe('daemon', () => {
  let repoPath
  let ipfs

  beforeEach(() => {
    repoPath = path.join(os.tmpdir(), 'ipfs-test-not-found-' + hat())
    ipfs = ipfsCmd(repoPath)
  })

  afterEach(() => clean(repoPath))

  skipOnWindows('do not crash if Addresses.Swarm is empty', function (done) {
    this.timeout(100 * 1000)
    // These tests are flaky, but retrying 3 times seems to make it work 99% of the time
    this.retries(3)

    ipfs('init').then(() => {
      return ipfs('config', 'Addresses', JSON.stringify({
        Swarm: [],
        API: '/ip4/127.0.0.1/tcp/0',
        Gateway: '/ip4/127.0.0.1/tcp/0'
      }), '--json')
    }).then(() => {
      const res = ipfs('daemon')
      const timeout = setTimeout(() => {
        done(new Error('Daemon did not get ready in time'))
      }, 1000 * 120)
      res.stdout.on('data', (data) => {
        const line = data.toString()
        if (line.includes('Daemon is ready')) {
          clearTimeout(timeout)
          res.kill()
          done()
        }
      })
    }).catch(err => done(err))
  })

  skipOnWindows('should handle SIGINT gracefully', function (done) {
    this.timeout(100 * 1000)

    testSignal(ipfs, 'SIGINT').then(() => {
      checkLock(repoPath, done)
    }).catch(done)
  })

  skipOnWindows('should handle SIGTERM gracefully', function (done) {
    this.timeout(100 * 1000)

    testSignal(ipfs, 'SIGTERM').then(() => {
      checkLock(repoPath, done)
    }).catch(done)
  })

  skipOnWindows('should handle SIGHUP gracefully', function (done) {
    this.timeout(100 * 1000)

    testSignal(ipfs, 'SIGHUP').then(() => {
      checkLock(repoPath, done)
    }).catch(done)
  })

  it('gives error if user hasn\'t run init before', function (done) {
    this.timeout(100 * 1000)

    const expectedError = 'no initialized ipfs repo found in ' + repoPath

    ipfs('daemon').catch((err) => {
      expect(err.stdout).to.have.string(expectedError)
      done()
    })
  })

  it('should be silent', function (done) {
    this.timeout(10 * 1000)
    const res = ipfs('daemon --silent')
    res.catch(function () {}) // Handles the unhandled promise rejection
    let output = ''
    const onData = (d) => { output += d }
    res.stdout.on('data', onData)
    res.stderr.on('data', onData)
    setTimeout(function () {
      res.kill()
      expect(output).to.be.empty()
      done()
    }, 5 * 1000)
  })

  it('should present ipfs path help when option help is received', function (done) {
    this.timeout(100 * 1000)

    ipfs('daemon --help').then((res) => {
      expect(res).to.have.string('export IPFS_PATH=/path/to/ipfsrepo')
      done()
    })
  })
})
