/* eslint-env mocha */

const expect = require('chai').expect
const nexpect = require('nexpect')
const fs = require('fs')

describe('config', () => {
  describe('api offline', () => {
    const repoTests = require('./index').repoTests
    const configPath = repoTests + '/config'

    const updatedConfig = () => JSON.parse(fs.readFileSync(configPath, 'utf8'))

    it('get a config key value', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'Identity.PeerID'])
        .run((err, stdout, exitcode) => {
          const expected = 'QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A'
          expect(stdout[0]).to.equal(expected)
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          done()
        })
    })

    it('set a config key with a string value', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'foo', 'bar'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(updatedConfig().foo).to.equal('bar')
          done()
        })
    })

    it('set a config key with true', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'foo', true, '--bool'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(updatedConfig().foo).to.equal(true)
          done()
        })
    })

    it('set a config key with false', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'foo', false, '--bool'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(updatedConfig().foo).to.equal(false)
          done()
        })
    })

    it('set a config key with json', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'foo', '{"bar": 0}', '--json'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(updatedConfig().foo).to.deep.equal({ bar: 0 })
          done()
        })
    })

    it('set a config key with invalid json', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'foo', '{"bar: 0}', '--json'])
        .run((err, stdout, exitcode) => {
          const expected = 'error\tinvalid JSON provided'
          expect(stdout[0]).to.equal(expected)
          expect(err).to.not.exist
          expect(exitcode).to.equal(1)
          done()
        })
    })

    it('call config with no arguments', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config'])
        .run((err, stdout, exitcode) => {
          const expected = "error\targument 'key' is required"
          expect(stdout[0]).to.equal(expected)
          expect(err).to.not.exist
          expect(exitcode).to.equal(1)
          done()
        })
    })
  })

  describe('api running', () => {})
})
