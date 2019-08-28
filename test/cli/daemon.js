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
const pkg = require('../../package.json')

const skipOnWindows = isWindows() ? it.skip : it

const checkLock = (repo) => {
  // skip on windows
  // https://github.com/ipfs/js-ipfsd-ctl/pull/155#issuecomment-326983530
  if (!isWindows) {
    if (fs.existsSync(path.join(repo, 'repo.lock'))) {
      throw new Error('repo.lock not removed')
    }
    if (fs.existsSync(path.join(repo, 'api'))) {
      throw new Error('api file not removed')
    }
  }
}

async function testSignal (ipfs, sig, config) {
  await ipfs('init')
  await ipfs('config', 'Addresses', JSON.stringify({
    API: '/ip4/127.0.0.1/tcp/0',
    Gateway: '/ip4/127.0.0.1/tcp/0'
  }), '--json')

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
}

describe('daemon', () => {
  let repoPath
  let ipfs

  beforeEach(() => {
    repoPath = path.join(os.tmpdir(), 'ipfs-test-not-found-' + hat())
    ipfs = ipfsCmd(repoPath)
  })

  afterEach(() => clean(repoPath))

  skipOnWindows('do not crash if Addresses.Swarm is empty', async function () {
    this.timeout(100 * 1000)
    // These tests are flaky, but retrying 3 times seems to make it work 99% of the time
    this.retries(3)

    await ipfs('init')
    await ipfs('config', 'Addresses', JSON.stringify({
      Swarm: [],
      API: '/ip4/127.0.0.1/tcp/0',
      Gateway: '/ip4/127.0.0.1/tcp/0'
    }), '--json')

    const stdout = await ipfs('daemon', {
      timeout: 1000 * 120
    })

    expect(stdout).to.include('Daemon is ready')
  })

  it('should allow bind to multiple addresses for API and Gateway', async function () {
    this.timeout(100 * 1000)

    const apiAddrs = [
      '/ip4/127.0.0.1/tcp/0',
      '/dns4/localhost/tcp/0'
    ]

    const gatewayAddrs = [
      '/ip4/127.0.0.1/tcp/0',
      '/dns4/localhost/tcp/0'
    ]

    await ipfs('init')
    await ipfs('config', 'Addresses.API', JSON.stringify(apiAddrs), '--json')
    await ipfs('config', 'Addresses.Gateway', JSON.stringify(gatewayAddrs), '--json')

    const daemon = ipfs('daemon')
    let stdout = ''

    daemon.stdout.on('data', (data) => {
      stdout += data.toString('utf8')

      if (stdout.includes('Daemon is ready')) {
        daemon.kill()
      }
    })

    try {
      await daemon
      throw new Error('Did not kill process')
    } catch (err) {
      // because we killed the process
      expect(err.message).to.include('SIGTERM')

      apiAddrs.forEach(addr => expect(err.stdout).to.include(`API listening on ${addr.slice(0, -2)}`))
      gatewayAddrs.forEach(addr => expect(err.stdout).to.include(`Gateway (read only) listening on ${addr.slice(0, -2)}`))
    }
  })

  it('should allow no bind addresses for API and Gateway', async function () {
    this.timeout(100 * 1000)

    await ipfs('init')
    await ipfs('config', 'Addresses.API', '[]', '--json')
    await ipfs('config', 'Addresses.Gateway', '[]', '--json')

    const daemon = ipfs('daemon')
    let stdout = ''

    daemon.stdout.on('data', (data) => {
      stdout += data.toString('utf8')

      if (stdout.includes('Daemon is ready')) {
        daemon.kill()
      }
    })

    try {
      await daemon
      throw new Error('Did not kill process')
    } catch (err) {
      // because we killed the process
      expect(err.message).to.include('SIGTERM')

      expect(err.stdout).to.not.include('API listening on')
      expect(err.stdout).to.not.include('Gateway (read only) listening on')
    }
  })

  skipOnWindows('should handle SIGINT gracefully', async function () {
    this.timeout(100 * 1000)

    await testSignal(ipfs, 'SIGINT')

    checkLock(repoPath)
  })

  skipOnWindows('should handle SIGTERM gracefully', async function () {
    this.timeout(100 * 1000)

    await testSignal(ipfs, 'SIGTERM')

    checkLock(repoPath)
  })

  skipOnWindows('should handle SIGHUP gracefully', async function () {
    this.timeout(100 * 1000)

    await testSignal(ipfs, 'SIGHUP')

    checkLock(repoPath)
  })

  it('gives error if user hasn\'t run init before', async function () {
    this.timeout(100 * 1000)

    const err = await ipfs.fail('daemon')

    expect(err.stdout).to.include('no initialized ipfs repo found in ' + repoPath)
  })

  it('should be silent', async function () {
    this.timeout(100 * 1000)
    await ipfs('init')

    const daemon = ipfs('daemon --silent')

    setTimeout(() => {
      daemon.kill()
    }, 5 * 1000)

    try {
      await daemon
      throw new Error('Did not kill process')
    } catch (err) {
      // because we killed the process
      expect(err.message).to.include('SIGTERM')
      expect(err.stdout).to.be.empty()
      expect(err.stderr).to.be.empty()
    }
  })

  it('should present ipfs path help when option help is received', async function () {
    this.timeout(100 * 1000)

    const result = await ipfs('daemon --help')

    expect(result).to.include('export IPFS_PATH=/path/to/ipfsrepo')
  })

  it('should print version info', async function () {
    this.timeout(100 * 1000)
    await ipfs('init')

    const daemon = ipfs('daemon')
    let stdout = ''

    daemon.stdout.on('data', (data) => {
      stdout += data.toString('utf8')

      if (stdout.includes('Daemon is ready')) {
        daemon.kill()
      }
    })

    try {
      await daemon
      throw new Error('Did not kill process')
    } catch (err) {
      // because we killed the process
      expect(err.message).to.include('SIGTERM')

      expect(err.stdout).to.include(`js-ipfs version: ${pkg.version}`)
      expect(err.stdout).to.include(`System version: ${os.arch()}/${os.platform()}`)
      expect(err.stdout).to.include(`Node.js version: ${process.versions.node}`)
    }
  })
})
