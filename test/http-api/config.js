/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const ncp = require('ncp').ncp
const rimraf = require('rimraf')
const waterfall = require('async/waterfall')

const isWindows = require('../utils/platforms').isWindows
const skipOnWindows = isWindows() ? describe.skip : describe

const fs = require('fs')
const path = require('path')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ exec: 'src/cli/bin.js' })

skipOnWindows('config endpoint', () => {
  const repoExample = path.join(__dirname, '../fixtures/go-ipfs-repo')
  const repoPath = path.join(__dirname, '../repo-tests-run')

  let updatedConfig = null

  let ipfs = null
  let ipfsd = null

  // wait until the repo is ready to use
  before(function (done) {
    this.timeout(10 * 1000)

    setTimeout(done, 5 * 1000)
  })

  before(function (done) {
    this.timeout(20 * 1000)

    ncp(repoExample, repoPath, (err) => {
      expect(err).to.not.exist()

      waterfall([
        (cb) => df.spawn({
          repoPath: repoPath,
          initOptions: { bits: 512 },
          config: { Bootstrap: [] },
          disposable: false,
          start: true
        }, cb),
        (_ipfsd, cb) => {
          ipfsd = _ipfsd
          ipfsd.start(cb)
        }
      ], (err) => {
        expect(err).to.not.exist()
        ipfs = ipfsd.api

        updatedConfig = () => {
          const config = fs.readFileSync(path.join(__dirname, '../repo-tests-run/config'))
          return JSON.parse(config, 'utf8')
        }

        done()
      })
    })
  })

  after((done) => {
    rimraf(repoPath, (err) => {
      expect(err).to.not.exist()
      ipfsd.stop(done)
    })
  })

  describe('.config', () => {
    it('.get returns error for request with invalid argument', (done) => {
      ipfs.config.get('kittens', (err, res) => {
        expect(err).to.exist()
        done()
      })
    })

    it('.get returns value for request with argument', (done) => {
      ipfs.config.get('API.HTTPHeaders', (err, value) => {
        expect(err).not.to.exist()
        expect(value).to.equal(null)
        done()
      })
    })

    it('.set updates value for request with both args', (done) => {
      ipfs.config.set('Datastore.Path', 'kitten', (err) => {
        expect(err).not.to.exist()
        done()
      })
    })

    it('.set returns error for request with both args and JSON flag with invalid JSON argument', (done) => {
      ipfs.config.set('Datastore.Path', 'kitten', { json: true }, (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('.set updates value for request with both args and bool flag and true argument', (done) => {
      ipfs.config.set('Datastore.Path', true, (err) => {
        expect(err).not.to.exist()
        done()
      })
    })

    it('.set updates value for request with both args and bool flag and false argument', (done) => {
      ipfs.config.set('Datastore.Path', false, (err) => {
        expect(err).not.to.exist()
        done()
      })
    })

    it('.get updatedConfig', (done) => {
      ipfs.config.get((err, config) => {
        expect(err).not.to.exist()
        expect(config).to.be.eql(updatedConfig())
        done()
      })
    })

    // This one is one stale mode till go-ipfs decides
    // what to do with the .replace command
    describe.skip('.replace', () => {
      it('returns error if the config is invalid', (done) => {
        const filePath = 'test/fixtures/test-data/badconfig'

        ipfs.config.replace(filePath, (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('updates value', (done) => {
        const filePath = 'test/fixtures/test-data/otherconfig'
        const expectedConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        ipfs.config.replace(filePath, (err) => {
          expect(err).not.to.exist()
          expect(expectedConfig).to.deep.equal(updatedConfig())
          done()
        })
      })
    })
  })
})
