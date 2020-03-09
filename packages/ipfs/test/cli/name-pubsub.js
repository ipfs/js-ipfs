/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const cli = require('../utils/cli')
const sinon = require('sinon')

function defaultResolveArgs (overrides = {}) {
  return {
    nocache: false,
    recursive: true,
    ...overrides
  }
}

describe('name-pubsub', () => {
  let ipfs

  // Spawn daemons
  beforeEach(() => {
    ipfs = {
      name: {
        pubsub: {
          state: sinon.stub(),
          cancel: sinon.stub(),
          subs: sinon.stub()
        },
        resolve: sinon.stub()
      }
    }
  })

  describe('pubsub commands', () => {
    it('should get enabled state of pubsub', async () => {
      ipfs.name.pubsub.state.resolves({
        enabled: true
      })

      const res = await cli('name pubsub state', { ipfs })
      expect(res).to.have.string('enabled') // enabled
    })

    it('should return best result when resolving a name', async () => {
      const name = 'ipns-name'
      const value = 'value'
      ipfs.name.resolve.withArgs(name, defaultResolveArgs()).returns([
        'first-result',
        value
      ])

      const out = await cli(`name resolve ${name}`, { ipfs })

      expect(out).to.equal(`${value}\n`)
    })

    it('should stream results from resoving a name', async () => {
      const name = 'ipns-name'
      const firstResult = 'first-result'
      const secondResult = 'value'
      ipfs.name.resolve.withArgs(name, defaultResolveArgs()).returns([
        firstResult,
        secondResult
      ])

      const out = await cli(`name resolve ${name} --stream true`, { ipfs })

      expect(out).to.equal(`${firstResult}\n${secondResult}\n`)
    })

    it('should be able to cancel subscriptions', async () => {
      const subName = 'sub-name'

      ipfs.name.pubsub.cancel.withArgs(subName).resolves({
        canceled: true
      })

      const out = await cli(`name pubsub cancel ${subName}`, { ipfs })

      expect(out).to.equal('canceled\n')
    })

    it('should not cancel subscriptions that do not exist', async () => {
      const subName = 'sub-name'

      ipfs.name.pubsub.cancel.withArgs(subName).resolves({
        canceled: false
      })

      const out = await cli(`name pubsub cancel ${subName}`, { ipfs })

      expect(out).to.equal('no subscription\n')
    })

    it('should list subscriptions', async () => {
      const subName = 'sub-name'

      ipfs.name.pubsub.subs.resolves([
        subName
      ])

      const out = await cli('name pubsub subs', { ipfs })

      expect(out).to.equal(`${subName}\n`)
    })
  })
})
