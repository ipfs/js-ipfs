/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const cli = require('../utils/cli')
const sinon = require('sinon')
const { profiles } = require('../../src/core/components/config')

describe('config', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      config: {
        set: sinon.stub(),
        get: sinon.stub(),
        replace: sinon.stub(),
        profiles: {
          apply: sinon.stub(),
          list: sinon.stub()
        }
      }
    }
  })

  describe('get/set', () => {
    it('set a config key with a string value', async () => {
      await cli('config foo bar', { ipfs })
      expect(ipfs.config.set.calledWith('foo', 'bar')).to.be.true()
    })

    it('set a config key with true', async () => {
      await cli('config foo true --bool', { ipfs })
      expect(ipfs.config.set.calledWith('foo', true)).to.be.true()
    })

    it('set a config key with false', async () => {
      await cli('config foo false --bool', { ipfs })
      expect(ipfs.config.set.calledWith('foo', false)).to.be.true()
    })

    it('set a config key with null', async () => {
      await cli('config foo null --json', { ipfs })
      expect(ipfs.config.set.calledWith('foo', null)).to.be.true()
    })

    it('set a config key with json', async () => {
      await cli('config foo {"bar":0} --json', { ipfs })
      expect(ipfs.config.set.calledWith('foo', { bar: 0 })).to.be.true()
    })

    it('set a config key with invalid json', async () => {
      await cli.fail('config foo {"bar:0"} --json', { ipfs })
    })

    it('get a config key value', async () => {
      ipfs.config.get.withArgs('Identity.PeerID').returns('hello')

      const out = await cli('config Identity.PeerID', { ipfs })
      expect(out).to.equal('hello\n')
    })

    it('call config with no arguments', async () => {
      const out = await cli.fail('config', { ipfs })
      expect(out).to.include('Not enough non-option arguments: got 0, need at least 1')
    })
  })

  describe('show', function () {
    this.timeout(40 * 1000)

    it('returns the full config', async () => {
      ipfs.config.get.returns({ foo: 'bar' })
      const out = await cli('config show', { ipfs })
      expect(JSON.parse(out)).to.be.eql({ foo: 'bar' })
    })
  })

  describe('replace', () => {
    it('replace config with file', async () => {
      const filePath = './package.json'
      const expectedConfig = require('../../package.json')

      await cli(`config replace ${filePath}`, { ipfs })

      expect(ipfs.config.replace.calledWith(expectedConfig)).to.be.true()
    })

    it('replace config with file in daemon mode', async () => {
      const filePath = './package.json'
      const fullPath = require.resolve('../../package.json')

      await cli(`config replace ${filePath}`, { ipfs, isDaemon: true })

      expect(ipfs.config.replace.calledWith(fullPath)).to.be.true()
    })
  })

  describe('profile', () => {
    Object.keys(profiles).forEach(profile => {
      it(`applies profile '${profile}'`, async () => {
        ipfs.config.profiles.apply.withArgs(profile, {
          dryRun: false
        }).returns({
          original: {
            foo: 'bar'
          },
          updated: {
            foo: 'baz'
          }
        })

        await cli(`config profile apply ${profile}`, { ipfs })

        expect(ipfs.config.profiles.apply.calledWith(profile, {
          dryRun: false
        })).to.be.true()
      })
    })

    it('--dry-run is passed to core', async () => {
      ipfs.config.profiles.apply.withArgs('server', {
        dryRun: true
      }).returns({
        original: {
          foo: 'bar'
        },
        updated: {
          foo: 'baz'
        }
      })

      await cli('config profile apply server --dry-run=true', { ipfs })

      expect(ipfs.config.profiles.apply.calledWith('server', {
        dryRun: true
      })).to.be.true()
    })

    it('lists available config profiles', async () => {
      ipfs.config.profiles.list.returns(
        Object.keys(profiles).map(profile => {
          return {
            name: profiles[profile].name,
            description: profiles[profile].description
          }
        })
      )
      const out = await cli('config profile ls', { ipfs })

      Object.keys(profiles => profile => {
        expect(out).includes(profiles[profile].name)
        expect(out).includes(profiles[profile].description)
      })
    })
  })
})
