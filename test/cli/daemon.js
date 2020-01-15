/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const clean = require('../utils/clean')
const ipfsCmd = require('../utils/ipfs-exec')
const isWindows = require('../utils/platforms').isWindows
const os = require('os')
const path = require('path')
const hat = require('hat')
const fs = require('fs')
const tempWrite = require('temp-write')
const pkg = require('../../package.json')

const skipOnWindows = isWindows() ? it.skip : it
const daemonReady = (daemon) => {
  return new Promise((resolve, reject) => {
    daemon.stdout.on('data', (data) => {
      if (data.toString().includes('Daemon is ready')) {
        resolve()
      }
    })
    daemon.stderr.on('data', (data) => {
      const line = data.toString('utf8')

      if (!line.includes('ExperimentalWarning')) {
        reject(new Error('Daemon didn\'t start ' + data.toString('utf8')))
      }
    })

    daemon.catch(err => {
      reject(err)
    })
  })
}
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

async function testSignal (ipfs, sig) {
  await ipfs('init')
  await ipfs('config', 'Addresses', JSON.stringify({
    API: '/ip4/127.0.0.1/tcp/0',
    Gateway: '/ip4/127.0.0.1/tcp/0'
  }), '--json')

  return new Promise((resolve, reject) => {
    const daemon = ipfs('daemon')
    let stdout = ''

    daemon.stdout.on('data', (data) => {
      stdout += data.toString('utf8')

      if (stdout.includes('Daemon is ready')) {
        daemon.kill(sig)
        resolve()
      }
    })

    daemon.catch((err) => {
      if (!err.killed) {
        reject(err)
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

    const daemon = ipfs('daemon')
    let stdout = ''
    let killed = false

    daemon.stdout.on('data', (data) => {
      stdout += data.toString('utf8')

      if (stdout.includes('Daemon is ready') && !killed) {
        killed = true
        daemon.kill()
      }
    })

    await expect(daemon).to.eventually.include('Daemon is ready')
      .and.to.include('Received interrupt signal, shutting down...')
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
    await ipfs(`config Addresses.API ${JSON.stringify(apiAddrs)} --json`)
    await ipfs(`config Addresses.Gateway ${JSON.stringify(gatewayAddrs)} --json`)

    const daemon = ipfs('daemon')
    let stdout = ''
    let killed = false

    daemon.stdout.on('data', (data) => {
      stdout += data.toString('utf8')

      if (stdout.includes('Daemon is ready') && !killed) {
        killed = true
        daemon.kill()
      }
    })

    await expect(daemon).to.eventually.include('Daemon is ready')
      .and.to.include('Received interrupt signal, shutting down...')

    apiAddrs.forEach(addr => expect(stdout).to.include(`API listening on ${addr.slice(0, -2)}`))
    gatewayAddrs.forEach(addr => expect(stdout).to.include(`Gateway (read only) listening on ${addr.slice(0, -2)}`))
  })

  it('should allow no bind addresses for API and Gateway', async function () {
    this.timeout(100 * 1000)

    await ipfs('init')
    await ipfs('config Addresses.API [] --json')
    await ipfs('config Addresses.Gateway [] --json')

    const daemon = ipfs('daemon')
    let stdout = ''
    let killed = false

    daemon.stdout.on('data', (data) => {
      stdout += data.toString('utf8')

      if (stdout.includes('Daemon is ready') && !killed) {
        killed = true
        daemon.kill()
      }
    })

    await expect(daemon).to.eventually.include('Daemon is ready')
      .and.to.include('Received interrupt signal, shutting down...')
      .and.not.include(/(API|Gateway \(read only\)) listening on/g)
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

  it('should be silent', async function () {
    this.timeout(100 * 1000)
    await ipfs('init')

    const daemon = ipfs('daemon --silent')

    setTimeout(() => {
      daemon.kill('SIGKILL')
    }, 5 * 1000)

    await expect(daemon)
      .to.eventually.be.rejected()
      .and.to.include({
        killed: true,
        stdout: ''
      })
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
    let killed = false

    daemon.stdout.on('data', (data) => {
      stdout += data.toString('utf8')

      if (stdout.includes('Daemon is ready') && !killed) {
        killed = true
        daemon.kill()
      }
    })

    await expect(daemon).to.eventually.include('Daemon is ready')
      .and.to.include('Received interrupt signal, shutting down...')
      .and.to.include(`js-ipfs version: ${pkg.version}`)
      .and.to.include(`System version: ${os.arch()}/${os.platform()}`)
      .and.to.include(`Node.js version: ${process.versions.node}`)
  })

  it('should init by default', async function () {
    this.timeout(100 * 1000)

    expect(fs.existsSync(repoPath)).to.be.false()

    const daemon = ipfs('daemon')
    let stdout = ''
    let killed = false

    daemon.stdout.on('data', (data) => {
      stdout += data.toString('utf8')

      if (stdout.includes('Daemon is ready') && !killed) {
        killed = true
        daemon.kill()
      }
    })

    await expect(daemon).to.eventually.include('Daemon is ready')
      .and.to.include('Received interrupt signal, shutting down...')

    expect(fs.existsSync(repoPath)).to.be.true()
  })

  it('should init with custom config', async function () {
    this.timeout(100 * 1000)
    const configPath = tempWrite.sync('{"Addresses": {"API": "/ip4/127.0.0.1/tcp/9999"}}', 'config.json')
    const daemon = ipfs(`daemon --init-config ${configPath}`)

    await daemonReady(daemon)
    const out = await ipfs('config \'Addresses.API\'')
    expect(out).to.be.eq('/ip4/127.0.0.1/tcp/9999\n')
  })

  it('should init with profiles', async function () {
    this.timeout(100 * 1000)
    const daemon = ipfs('daemon --init-profile test')

    await daemonReady(daemon)
    const out = await ipfs('config Bootstrap')
    expect(out).to.be.eq('[]\n')
  })
})
