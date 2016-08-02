/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')
const fs = require('fs')
const HttpAPI = require('../../src/http-api')
const repoPath = require('./index').repoPath
const path = require('path')
const _ = require('lodash')

describe('config', () => {
  const configPath = path.join(repoPath, 'config')
  const originalConfigPath = path.join(__dirname, '../go-ipfs-repo/config')
  const updatedConfig = () => JSON.parse(fs.readFileSync(configPath, 'utf8'))
  const restoreConfig = () => fs.writeFileSync(configPath, fs.readFileSync(originalConfigPath, 'utf8'), 'utf8')

  const env = _.clone(process.env)
  env.IPFS_PATH = repoPath

  describe('api offline', () => {
    describe('get/set', () => {
      it('get a config key value', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'Identity.PeerID'], {env})
          .run((err, stdout, exitcode) => {
            const expected = 'QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A'
            expect(stdout[0]).to.equal(expected)
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)
            done()
          })
      })

      it('set a config key with a string value', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'foo', 'bar'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(updatedConfig().foo).to.equal('bar')
            expect(exitcode).to.equal(0)
            done()
          })
      })

      it('set a config key with true', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'foo', true, '--bool'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)
            expect(updatedConfig().foo).to.equal(true)
            done()
          })
      })

      it('set a config key with false', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'foo', false, '--bool'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)
            expect(updatedConfig().foo).to.equal(false)
            done()
          })
      })

      it('set a config key with json', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'foo', '{"bar": 0}', '--json'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)
            expect(updatedConfig().foo).to.deep.equal({ bar: 0 })
            done()
          })
      })

      it('set a config key with invalid json', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'foo', '{"bar: 0}', '--json'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(1)
            done()
          })
      })

      it('call config with no arguments', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(1)
            done()
          })
      })
    })

    describe('replace', () => {
      it('replace config with file', (done) => {
        const filePath = 'test/test-data/otherconfig'
        const expectedConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'replace', filePath], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)

            expect(updatedConfig()).to.deep.equal(expectedConfig)
            done()
          })
      })

      after(() => {
        restoreConfig()
      })
    })
  })

  describe('api running', () => {
    let httpAPI

    before((done) => {
      httpAPI = new HttpAPI(repoPath)
      httpAPI.start((err) => {
        expect(err).to.not.exist
        done()
      })
    })

    after((done) => {
      console.log('stopping')
      httpAPI.stop((err) => {
        console.log('stopped')
        expect(err).to.not.exist
        done()
      })
    })

    describe('get/set', () => {
      it('get a config key value', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'Identity.PeerID'], {env})
          .run((err, stdout, exitcode) => {
            const expected = 'QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A'
            expect(stdout[0]).to.equal(expected)
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)
            done()
          })
      })

      it('set a config key with a string value', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'foo', 'bar'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)
            expect(updatedConfig().foo).to.equal('bar')
            done()
          })
      })

      it('set a config key with true', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'foo', true, '--bool'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)
            expect(updatedConfig().foo).to.equal(true)
            done()
          })
      })

      it('set a config key with false', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'foo', false, '--bool'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)
            expect(updatedConfig().foo).to.equal(false)
            done()
          })
      })

      it('set a config key with json', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'foo', '{"bar": 0}', '--json'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)
            expect(updatedConfig().foo).to.deep.equal({ bar: 0 })
            done()
          })
      })

      it('set a config key with invalid json', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'foo', '{"bar: 0}', '--json'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(1)
            done()
          })
      })

      it('call config with no arguments', (done) => {
        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config'], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(1)
            done()
          })
      })
    })

    describe('replace', () => {
      it('replace config with file', (done) => {
        const filePath = 'test/test-data/otherconfig'
        const expectedConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'config', 'replace', filePath], {env})
          .run((err, stdout, exitcode) => {
            expect(err).to.not.exist
            expect(exitcode).to.equal(0)

            expect(updatedConfig()).to.deep.equal(expectedConfig)
            done()
          })
      })

      after(() => {
        restoreConfig()
      })
    })
  })
})
