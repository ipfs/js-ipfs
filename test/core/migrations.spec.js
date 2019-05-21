/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const hat = require('hat')
const sinon = require('sinon')

const IPFS = require('../../src/core')
const migrator = require('ipfs-repo-migrations')
const repoVersion = require('ipfs-repo').repoVersion

// This gets replaced by `create-repo-browser.js` in the browser
const createTempRepo = require('../utils/create-repo-nodejs.js')

async function initRepo (repo) {
  const ipfs = new IPFS({
    repo: repo,
    init: false,
    start: false
  })

  await ipfs.init({ bits: 512, pass: hat() })
}

function setConfig (repo, key, value) {
  return new Promise(((resolve, reject) => {
      repo.config.set(key, value, (e) => {
        if (e) {
          return reject(e)
        }

        resolve()
      })
    }
  ))
}

describe('migrations', () => {

  let repo
  let migrateStub
  let currentVersionStub
  let getLatestMigrationVersionStub

  before(() => {
    currentVersionStub = sinon.stub(migrator, 'getCurrentRepoVersion')
    migrateStub = sinon.stub(migrator, 'migrate')
    getLatestMigrationVersionStub = sinon.stub(migrator, 'getLatestMigrationVersion')
  })

  after(() => {
    currentVersionStub.restore()
    migrateStub.restore()
  })

  beforeEach(() => {
    sinon.reset()
    repo = createTempRepo()
  })

  afterEach((done) => repo.teardown(done))

  it('should migrate by default', (done) => {
    migrateStub.resolves()
    currentVersionStub.resolves(repoVersion - 1)
    getLatestMigrationVersionStub.returns(repoVersion)

    initRepo(repo)
      .then(() => {

        // Should not migrate when repo does not exists/is not initialized
        expect(migrateStub.called).to.be.false()

        const migratingIpfs = new IPFS({
          repo: repo,
          init: false,
          start: false
        })

        migratingIpfs.on('ready', () => {
          expect(migrateStub.called).to.be.true()
          done()
        })
      })
  })

  it('should not migrate when repoDisableAutoMigration is true', (done) => {
    migrateStub.resolves()
    currentVersionStub.resolves(repoVersion - 1)
    getLatestMigrationVersionStub.returns(repoVersion)

    initRepo(repo)
      .then(() => setConfig(repo, 'repoDisableAutoMigration', true))
      .then(() => {
        const migratingIpfs = new IPFS({
          repo: repo,
          init: false,
          start: false
        })

        migratingIpfs.on('ready', () => {
          expect(migrateStub.called).to.be.false()
          done()
        })
      })
  })

  it('should not migrate when versions matches', (done) => {
    migrateStub.resolves()
    currentVersionStub.resolves(repoVersion)
    getLatestMigrationVersionStub.returns(repoVersion)

    initRepo(repo)
      .then(() => {
        const migratingIpfs = new IPFS({
          repo: repo,
          init: false,
          start: false
        })

        migratingIpfs.on('ready', () => {
          expect(migrateStub.called).to.be.false()
          done()
        })
      })
  })

  it('should not migrate when current repo versions is higher then expected', (done) => {
    migrateStub.resolves()
    currentVersionStub.resolves(repoVersion + 1)
    getLatestMigrationVersionStub.returns(repoVersion)

    initRepo(repo)
      .then(() => {
        const migratingIpfs = new IPFS({
          repo: repo,
          init: false,
          start: false
        })

        migratingIpfs.on('ready', () => {
          expect(migrateStub.called).to.be.false()
          done()
        })
      })
  })

  it('should fail if ipfs-repo-migrations does not contain expected migration', (done) => {
    getLatestMigrationVersionStub.returns(repoVersion - 1)
    migrateStub.resolves()
    currentVersionStub.resolves(repoVersion - 1)

    initRepo(repo)
      .then(() => {
        const migratingIpfs = new IPFS({
          repo: repo,
          init: false,
          start: false
        })

        migratingIpfs.on('error', (err) => {
          expect(err).to.exist()
          expect(err.message).to.match(/The ipfs-repo-migrations package does not have migration for version: /)
          done()
        })
      })
  })
})
