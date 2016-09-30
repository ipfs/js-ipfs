/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const fs = require('fs')
const path = require('path')

module.exports = (ctl) => {
  describe('.config', () => {
    const configPath = path.join(__dirname, '../../repo-tests-async/http/config')
    let updatedConfig

    before(() => {
      updatedConfig = () => JSON.parse(fs.readFileSync(configPath, 'utf8'))
    })

    it('.get returns error for request with invalid argument', (done) => {
      ctl.config.get('kittens', (err, res) => {
        expect(err).to.exist
        done()
      })
    })

    it('.get returns value for request with argument', (done) => {
      ctl.config.get('API.HTTPHeaders', (err, value) => {
        expect(err).not.to.exist
        expect(value).to.equal(null)
        done()
      })
    })

    it('.set updates value for request with both args', (done) => {
      ctl.config.set('Datastore.Path', 'kitten', (err) => {
        expect(err).not.to.exist
        done()
      })
    })

    it('.set returns error for request with both args and JSON flag with invalid JSON argument', (done) => {
      ctl.config.set('Datastore.Path', 'kitten', { json: true }, (err) => {
        expect(err).to.exist
        done()
      })
    })

    it('.set updates value for request with both args and bool flag and true argument', (done) => {
      ctl.config.set('Datastore.Path', true, (err) => {
        expect(err).not.to.exist
        done()
      })
    })

    it('.set updates value for request with both args and bool flag and false argument', (done) => {
      ctl.config.set('Datastore.Path', false, (err) => {
        expect(err).not.to.exist
        done()
      })
    })

    it('.get updatedConfig', (done) => {
      ctl.config.get((err, config) => {
        expect(err).not.to.exist
        expect(config).to.be.eql(updatedConfig())
        done()
      })
    })

    // This one is one stale mode till go-ipfs decides
    // what to do
    describe('.replace', () => {
      it('returns error if the config is invalid', (done) => {
        const filePath = 'test/test-data/badconfig'

        ctl.config.replace(filePath, (err) => {
          expect(err).to.exist
          done()
        })
      })

      it('updates value', (done) => {
        const filePath = 'test/test-data/otherconfig'
        const expectedConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        ctl.config.replace(filePath, (err) => {
          expect(err).not.to.exist
          expect(expectedConfig).to.deep.equal(updatedConfig())
          done()
        })
      })
    })
  })
}
