/* eslint-env mocha */
'use strict'

const os = require('os')
const fs = require('fs').promises
const path = require('path')
const hat = require('hat')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const { repoVersion } = require('ipfs-repo')
const promisify = require('promisify-es6')
const ncp = promisify(require('ncp').ncp)
const runOnAndOff = require('../utils/on-and-off')
const ipfsExec = require('../utils/ipfs-exec')
const clean = require('../utils/clean')

describe('general cli options', () => runOnAndOff.off((thing) => {
  it('should handle --silent flag', async () => {
    const out = await thing.ipfs('help --silent')
    expect(out).to.be.empty()
  })

  it('should handle unknown arguments correctly', async () => {
    const out = await thing.ipfs('random --again')
    expect(out).to.include('Unknown arguments: again, random')
    expect(out).to.include('random')
    expect(out).to.include('again')
  })
}))

describe('--migrate', () => {
  let ipfs, repoPath

  async function setRepoVersion (version) {
    await fs.writeFile(path.join(repoPath, 'version'), version)
  }

  async function getRepoVersion () {
    return parseInt(await fs.readFile(path.join(repoPath, 'version'), 'utf8'))
  }

  beforeEach(async () => {
    repoPath = path.join(os.tmpdir(), `ipfs-${hat()}`)
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
    expect(err.stdout).to.include('Pass --migrate for automatic migration')
    const version = await getRepoVersion()
    expect(version).to.equal(5) // Should not have migrated
  })

  it('should not migrate for other commands when --migrate flag not set', async () => {
    // There are no migrations prior to 7 so it's safe to set version to 5 since
    // the repo is the same. We set to 5 because version 6 & 7 are considered
    // the same in repo.version.check.
    await setRepoVersion(5)
    const err = await ipfs.fail('files ls')
    expect(err.stdout).to.include('Pass --migrate for automatic migration')
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

    daemon.stdout.on('data', data => {
      stdout += data.toString('utf8')

      if (stdout.includes('Daemon is ready')) {
        daemon.kill()
      }
    })

    await expect(daemon)
      .to.eventually.be.rejected()
      .and.to.include({
        killed: true
      })

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
