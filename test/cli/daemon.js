/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const clean = require('../utils/clean')
const ipfsCmd = require('../utils/ipfs-exec')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const os = require('os')
const fs = require('fs')
const path = require('path')

const isWindows = os.platform() === 'win32'

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
  let proc = null
  return ipfs('init').then(() => {
    proc = ipfs('daemon')
    return new Promise((resolve, reject) => {
      pull(
        toPull(proc.stdout),
        pull.collect((err, res) => {
          expect(err).to.not.exist()
          const data = res.toString()
          if (data.includes(`Daemon is ready`)) {
            if (proc.kill(sig)) {
              resolve()
            } else {
              reject(new Error(`Unable to ${sig} process`))
            }
          }
        })
      )

      pull(
        toPull(proc.stderr),
        pull.collect((err, res) => {
          expect(err).to.not.exist()
          const data = res.toString()
          if (data.length > 0) {
            reject(new Error(data))
          }
        })
      )
    })
  })
}

describe('daemon', () => {
  let repoPath
  let ipfs

  beforeEach(() => {
    repoPath = '/tmp/ipfs-test-not-found-' + Math.random().toString().substring(2, 8)
    ipfs = ipfsCmd(repoPath)
  })

  afterEach(() => clean(repoPath))

  // TODO: test fails
  it.skip('do not crash if Addresses.Swarm is empty', function (done) {
    this.timeout(20 * 1000)

    ipfs('init').then(() => {
      return ipfs('config', 'Addresses', JSON.stringify({
        API: '/ip4/127.0.0.1/tcp/0',
        Gateway: '/ip4/127.0.0.1/tcp/0'
      }), '--json')
    }).then(() => {
      return ipfs('daemon')
    }).then((res) => {
      expect(res).to.have.string('Daemon is ready')
      done()
    }).catch((err) => done(err))
  })

  // TODO: test fails
  it.skip('should handle SIGINT gracefully', function (done) {
    this.timeout(20 * 1000)

    testSignal(ipfs, 'SIGINT').then(() => {
      checkLock(repoPath, done)
    }).catch(done)
  })

  // TODO: test fails
  it.skip('should handle SIGTERM gracefully', function (done) {
    this.timeout(20 * 1000)

    testSignal(ipfs, 'SIGTERM').then(() => {
      checkLock(repoPath, done)
    }).catch(done)
  })

  it('gives error if user hasn\'t run init before', (done) => {
    const expectedError = 'no initialized ipfs repo found in ' + repoPath

    ipfs('daemon').catch((err) => {
      expect(err.stdout).to.have.string(expectedError)
      done()
    })
  })
})
