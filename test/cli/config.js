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

    it('set a config key with a string value', async () => {
      await ipfs('config foo bar')
      expect(updatedConfig().foo).to.equal('bar')
    })

    it('set a config key with true', async () => {
      await ipfs('config foo true --bool')
      expect(updatedConfig().foo).to.equal(true)
    })

    it('set a config key with false', async () => {
      await ipfs('config foo false --bool')
      expect(updatedConfig().foo).to.equal(false)
    })

    it('set a config key with null', async () => {
      await ipfs('config foo null --json')
      expect(updatedConfig().foo).to.equal(null)
    })

    it('set a config key with json', async () => {
      await ipfs('config foo {"bar":0} --json')
      expect(updatedConfig().foo).to.deep.equal({ bar: 0 })
    })

    it('set a config key with invalid json', async () => {
      await ipfs.fail('config foo {"bar:0"} --json')
    })

    it('get a config key value', async () => {
      const out = await ipfs('config Identity.PeerID')
      expect(out).to.exist()
    })

    it('call config with no arguments', async () => {
      const out = await ipfs('config')
      expect(out).to.include('Not enough non-option arguments: got 0, need at least 1')
    })
  })

  describe('show', function () {
    this.timeout(40 * 1000)

    it('returns the full config', async () => {
      const out = await ipfs('config show')
      expect(JSON.parse(out)).to.be.eql(updatedConfig())
    })
  })

  describe.skip('replace', () => {
    it('replace config with file', async () => {
      const filePath = 'test/fixtures/test-data/otherconfig'
      const expectedConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'))

      await ipfs(`config replace ${filePath}`)
      expect(updatedConfig()).to.be.eql(expectedConfig)
    })

    after(() => {
      restoreConfig()
    })
  })
}))
