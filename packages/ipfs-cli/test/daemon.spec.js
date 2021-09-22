/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import os from 'os'
import path from 'path'
import { nanoid } from 'nanoid'
import fs from 'fs'
import { clean } from './utils/clean.js'
import { ipfsExec } from './utils/ipfs-exec.js'
import { isWindows } from './utils/platforms.js'
import tempWrite from 'temp-write'

/**
 * @param {*} daemon
 * @param {*} [options]
 */
const daemonReady = async (daemon, options) => {
  options = options || {}

  let stdout = ''
  let isReady = false

  const readyPromise = new Promise((resolve, reject) => {
    daemon.stdout.on('data', async data => {
      stdout += data

      if (stdout.includes('Daemon is ready') && !isReady) {
        isReady = true

        if (options.onReady) {
          try {
            await options.onReady(stdout)
          } catch (/** @type {any} */ err) {
            return reject(err)
          }
        }

        resolve()
      }
    })

    daemon.stderr.on('data', (data) => {
      if (process && process.env && process.env.DEBUG) {
        // causes data to be written out to stderr
        return
      }

      if (!data.toString().includes('ExperimentalWarning')) {
        reject(new Error('Daemon didn\'t start ' + data))
      }
    })
  })

  try {
    await readyPromise
    daemon.kill(options.killSignal)
    await daemon
    return stdout
  } catch (/** @type {any} */ err) {
    // Windows does not support sending signals, but Node.js offers some
    // emulation. Sending SIGINT, SIGTERM, and SIGKILL cause the unconditional
    // termination of the target process.
    // https://nodejs.org/dist/latest/docs/api/process.html#process_signal_events
    // i.e. The process will exit with non-zero code (normally our signal
    // handlers cleanly exit)
    if (isWindows && isReady) {
      return stdout
    }
    throw err
  }
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

async function testSignal (ipfs, killSignal) {
  await ipfs('init')
  await ipfs(['config', 'Addresses', JSON.stringify({
    API: '/ip4/127.0.0.1/tcp/0',
    Gateway: '/ip4/127.0.0.1/tcp/0'
  }), '--json'].join(' '))

  const daemon = ipfs('daemon')
  return daemonReady(daemon, { killSignal })
}

describe.skip('daemon', () => {
  /** @type {string} */
  let repoPath
  /** @type {ReturnType<ipfsExec>} */
  let ipfs

  beforeEach(() => {
    repoPath = path.join(os.tmpdir(), 'ipfs-test-not-found-' + nanoid())
    ipfs = ipfsExec(repoPath)
  })

  afterEach(() => clean(repoPath))

  it('should not crash if Addresses.Swarm is empty', async function () {
    if (isWindows) return this.skip()
    this.timeout(100 * 1000)

    await ipfs('init')
    await ipfs(['config', 'Addresses', JSON.stringify({
      Swarm: [],
      API: '/ip4/127.0.0.1/tcp/0',
      Gateway: '/ip4/127.0.0.1/tcp/0'
    }), '--json'].join(' '))

    const daemon = ipfs('daemon')
    await daemonReady(daemon)
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
    const stdout = await daemonReady(daemon)

    apiAddrs.forEach(addr => expect(stdout).to.include(`API listening on ${addr.slice(0, -2)}`))
    gatewayAddrs.forEach(addr => expect(stdout).to.include(`Gateway (read only) listening on ${addr.slice(0, -2)}`))
  })

  it('should allow no bind addresses for API and Gateway', async function () {
    this.timeout(100 * 1000)

    await ipfs('init')
    await ipfs('config Addresses.API [] --json')
    await ipfs('config Addresses.Gateway [] --json')

    const daemon = ipfs('daemon')
    const stdout = await daemonReady(daemon)

    expect(stdout).to.not.include(/(API|Gateway \(read only\)) listening on/g)
  })

  it('should handle SIGINT gracefully', async function () {
    if (isWindows) return this.skip()
    this.timeout(100 * 1000)

    await testSignal(ipfs, 'SIGINT')

    checkLock(repoPath)
  })

  it('should handle SIGTERM gracefully', async function () {
    if (isWindows) return this.skip()
    this.timeout(100 * 1000)

    await testSignal(ipfs, 'SIGTERM')

    checkLock(repoPath)
  })

  it('should handle SIGHUP gracefully', async function () {
    if (isWindows) return this.skip()
    this.timeout(100 * 1000)

    await testSignal(ipfs, 'SIGHUP')

    checkLock(repoPath)
  })

  it('should be silent', async function () {
    if (process && process.env && process.env.DEBUG) return this.skip()

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
    const stdout = await daemonReady(daemon)

    expect(stdout).to.include('js-ipfs version:')
    expect(stdout).to.include(`System version: ${os.arch()}/${os.platform()}`)
    expect(stdout).to.include(`Node.js version: ${process.versions.node}`)
  })

  it('should init by default', async function () {
    this.timeout(100 * 1000)

    expect(fs.existsSync(repoPath)).to.be.false()

    const daemon = ipfs('daemon')
    await daemonReady(daemon)

    expect(fs.existsSync(repoPath)).to.be.true()
  })

  it('should init with custom config', async function () {
    this.timeout(100 * 1000)
    const configPath = tempWrite.sync('{"Addresses": {"API": "/ip4/127.0.0.1/tcp/9999"}}', 'config.json')
    const daemon = ipfs(`daemon --init-config ${configPath}`)

    await daemonReady(daemon, {
      async onReady () {
        const out = await ipfs('config \'Addresses.API\'')
        expect(out).to.be.eq('/ip4/127.0.0.1/tcp/9999\n')
      }
    })
  })

  it('should init with profiles', async function () {
    this.timeout(100 * 1000)
    const daemon = ipfs('daemon --init-profile test')

    await daemonReady(daemon, {
      async onReady () {
        const out = await ipfs('config Bootstrap')
        expect(out).to.be.eq('[]\n')
      }
    })
  })

  it('should print help when command is unknown', async function () {
    this.timeout(100 * 1000)

    const err = await ipfs.fail('derp')

    expect(err).to.have.property('stderr').that.includes('Commands:')
    expect(err).to.have.property('stderr').that.includes('Unknown argument: derp')
  })
})
