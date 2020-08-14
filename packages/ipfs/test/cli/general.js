/* eslint-env mocha */
'use strict'

const os = require('os')
const fs = require('fs').promises
const path = require('path')
const { nanoid } = require('nanoid')
const { expect } = require('aegir/utils/chai')
const { repoVersion } = require('ipfs-repo')
const { promisify } = require('util')
const ncp = promisify(require('ncp').ncp)
const ipfsExec = require('../utils/ipfs-exec')
const clean = require('../utils/clean')
const { isWindows } = require('../utils/platforms')
const cli = require('../utils/cli')
const sinon = require('sinon')
const uint8ArrayToString = require('uint8arrays/to-string')

describe('general cli options', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      version: sinon.stub()
    }
  })

  it('should handle unknown arguments correctly', async () => {
    const out = await cli.fail('random --again', { ipfs })
    expect(out).to.include('Unknown arguments: again, random')
  })
})

describe('--migrate', () => {
  let ipfs, repoPath

  async function setRepoVersion (version) {
    await fs.writeFile(path.join(repoPath, 'version'), version.toString())
  }

  async function getRepoVersion () {
    return parseInt(await fs.readFile(path.join(repoPath, 'version'), 'utf8'))
  }

  beforeEach(async () => {
    repoPath = path.join(os.tmpdir(), `ipfs-${nanoid()}`)
    const v7RepoPath = path.join(__dirname, '../fixtures/v7-repo')
    await ncp(v7RepoPath, repoPath)
    ipfs = ipfsExec(repoPath)
  })

  afterEach(() => clean(repoPath))

  it('should not migrate for daemon command when --migrate flag not set', async () => {
    // There are no migrations prior to 7 so it's safe to set version to 5 since
    // the repo is the same. We set to 5 because version 6 & 7 are considered
    // the same in repo.version.check.
    await setRepoVersion(5)
    const err = await ipfs.fail('daemon')
    expect(err.stderr).to.include('Pass --migrate for automatic migration')
    const version = await getRepoVersion()
    expect(version).to.equal(5) // Should not have migrated
  })

  it('should not migrate for other commands when --migrate flag not set', async () => {
    // There are no migrations prior to 7 so it's safe to set version to 5 since
    // the repo is the same. We set to 5 because version 6 & 7 are considered
    // the same in repo.version.check.
    await setRepoVersion(5)
    const err = await ipfs.fail('files ls')
    expect(err.stderr).to.include('Pass --migrate for automatic migration')
    const version = await getRepoVersion()
    expect(version).to.equal(5) // Should not have migrated
  })

  it('should migrate for daemon command when --migrate flag set', async () => {
    // There are no migrations prior to 7 so it's safe to set version to 5 since
    // the repo is the same. We set to 5 because version 6 & 7 are considered
    // the same in repo.version.check.
    await setRepoVersion(5)

    const daemon = ipfs('daemon --migrate')
    let stdout = ''
    let killed = false

    daemon.stdout.on('data', data => {
      stdout += uint8ArrayToString(data)

      if (stdout.includes('Daemon is ready') && !killed) {
        killed = true
        daemon.kill()
      }
    })

    if (isWindows) {
      await expect(daemon)
        .to.eventually.be.rejected()
        .and.to.include({ killed: true })
        .and.to.have.a.property('stdout').that.includes('Daemon is ready')
    } else {
      await expect(daemon)
        .to.eventually.include('Daemon is ready')
        .and.to.include('Received interrupt signal, shutting down...')
    }

    const version = await getRepoVersion()
    expect(version).to.equal(repoVersion) // Should have migrated to latest
  })

  it('should migrate for other commands when --migrate flag set', async () => {
    // There are no migrations prior to 7 so it's safe to set version to 5 since
    // the repo is the same. We set to 5 because version 6 & 7 are considered
    // the same in repo.version.check.
    await setRepoVersion(5)
    await ipfs('files ls --migrate')
    const version = await getRepoVersion()
    expect(version).to.equal(repoVersion) // Should have migrated to latest
  })
})
