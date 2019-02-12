/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const fs = require('fs')
const path = require('path')
const runOnAndOff = require('../utils/on-and-off')

describe('config', () => runOnAndOff((thing) => {
  let ipfs
  let configPath
  let originalConfigPath
  let updatedConfig
  let restoreConfig

  before(() => {
    ipfs = thing.ipfs
    configPath = path.join(ipfs.repoPath, 'config')
    originalConfigPath = path.join(__dirname, '../fixtures/go-ipfs-repo/config')
    updatedConfig = () => JSON.parse(fs.readFileSync(configPath, 'utf8'))
    restoreConfig = () => fs.writeFileSync(configPath, fs.readFileSync(originalConfigPath, 'utf8'), 'utf8')
  })

  describe('get/set', function () {
    this.timeout(40 * 1000)

    it('set a config key with a string value', () => {
      return ipfs('config foo bar').then((out) => {
        expect(updatedConfig().foo).to.equal('bar')
      })
    })

    it('set a config key with true', () => {
      return ipfs('config foo true --bool').then((out) => {
        expect(updatedConfig().foo).to.equal(true)
      })
    })

    it('set a config key with false', () => {
      return ipfs('config foo false --bool').then((out) => {
        expect(updatedConfig().foo).to.equal(false)
      })
    })

    it('set a config key with null', () => {
      return ipfs('config foo null --json').then((out) => {
        expect(updatedConfig().foo).to.equal(null)
      })
    })

    it('set a config key with json', () => {
      return ipfs('config foo {"bar":0} --json').then((out) => {
        expect(updatedConfig().foo).to.deep.equal({ bar: 0 })
      })
    })

    it('set a config key with invalid json', () => {
      return ipfs.fail('config foo {"bar:0} --json')
    })

    it('get a config key value', () => {
      return ipfs('config Identity.PeerID').then((out) => {
        expect(out).to.exist()
      })
    })

    it('call config with no arguments', () => {
      return ipfs('config')
        .then(out => expect(out).to.include('Not enough non-option arguments: got 0, need at least 1'))
    })
  })

  describe('show', function () {
    this.timeout(40 * 1000)

    it('returns the full config', () => {
      return ipfs('config show').then((out) => {
        expect(JSON.parse(out)).to.be.eql(updatedConfig())
      })
    })
  })

  describe.skip('replace', () => {
    it('replace config with file', () => {
      const filePath = 'test/fixtures/test-data/otherconfig'
      const expectedConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'))

      return ipfs(`config replace ${filePath}`).then((out) => {
        expect(updatedConfig()).to.be.eql(expectedConfig)
      })
    })

    after(() => {
      restoreConfig()
    })
  })
}))
