/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const repoPath = require('./index').repoPath
const ipfs = require('../utils/ipfs-exec')(repoPath)
const describeOnlineAndOffline = require('../utils/on-and-off')

describe('config', () => {
  const configPath = path.join(repoPath, 'config')
  const originalConfigPath = path.join(__dirname, '../go-ipfs-repo/config')
  const updatedConfig = () => JSON.parse(fs.readFileSync(configPath, 'utf8'))
  const restoreConfig = () => fs.writeFileSync(configPath, fs.readFileSync(originalConfigPath, 'utf8'), 'utf8')

  describeOnlineAndOffline(repoPath, () => {
    describe('get/set', () => {
      it('get a config key value', () => {
        return ipfs('config Identity.PeerID').then((out) => {
          expect(out).to.be.eql(
            'QmQ2zigjQikYnyYUSXZydNXrDRhBut2mubwJBaLXobMt3A'
          )
        })
      })

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

      it('set a config key with json', () => {
        return ipfs('config foo {"bar":0} --json').then((out) => {
          expect(updatedConfig().foo).to.deep.equal({ bar: 0 })
        })
      })

      it('set a config key with invalid json', () => {
        return ipfs.fail('config foo {"bar:0} --json')
      })

      it('call config with no arguments', () => {
        return ipfs.fail('config')
      })
    })

    describe('show', () => {
      it('returns the full config', () => {
        return ipfs('config show').then((out) => {
          expect(JSON.parse(out)).to.be.eql(updatedConfig())
        })
      })
    })

    describe('replace', () => {
      it('replace config with file', () => {
        const filePath = 'test/test-data/otherconfig'
        const expectedConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        return ipfs(`config replace ${filePath}`).then((out) => {
          expect(updatedConfig()).to.be.eql(expectedConfig)
        })
      })

      after(() => {
        restoreConfig()
      })
    })
  })
})
