/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const waterfall = require('async/waterfall')

const fs = require('fs')
const path = require('path')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ exec: 'src/cli/bin.js' })

describe('extra config', () => {
  // TODO: this didn't seem to point anywhere
  const configPath = path.join(__dirname, '../../fixtures/go-ipfs-repo/config')

  let updatedConfig = null

  let ipfs = null
  let ipfsd = null
  before(function (done) {
    this.timeout(20 * 1000)

    waterfall([
      (cb) => df.spawn({
        repoPath: path.join(__dirname, '../../fixtures/go-ipfs-repo'),
        initOptions: { bits: 512 },
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
      updatedConfig = () => JSON.parse(fs.readFileSync(configPath, 'utf8'))
      done()
    })
  })

  after((done) => ipfsd.stop(done))

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
