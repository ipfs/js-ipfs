/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { cli } from './utils/cli.js'
import sinon from 'sinon'

describe('name pubsub', () => {
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

  describe('state', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should get enabled state of pubsub', async () => {
      ipfs.name.pubsub.state.withArgs(defaultOptions).resolves({
        enabled: true
      })

      const res = await cli('name pubsub state', { ipfs })
      expect(res).to.have.string('enabled') // enabled
    })

    it('should get enabled state of pubsub with a timeout', async () => {
      ipfs.name.pubsub.state.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).resolves({
        enabled: true
      })

      const res = await cli('name pubsub state --timeout=1s', { ipfs })
      expect(res).to.have.string('enabled') // enabled
    })
  })

  describe('cancel', () => {
    const subName = 'sub-name'
    const defaultOptions = {
      timeout: undefined
    }

    it('should be able to cancel subscriptions', async () => {
      ipfs.name.pubsub.cancel.withArgs(subName, defaultOptions).resolves({
        canceled: true
      })

      const out = await cli(`name pubsub cancel ${subName}`, { ipfs })

      expect(out).to.equal('canceled\n')
    })

    it('should not cancel subscriptions that do not exist', async () => {
      ipfs.name.pubsub.cancel.withArgs(subName, defaultOptions).resolves({
        canceled: false
      })

      const out = await cli(`name pubsub cancel ${subName}`, { ipfs })

      expect(out).to.equal('no subscription\n')
    })

    it('should be able to cancel subscriptions with a timeout', async () => {
      ipfs.name.pubsub.cancel.withArgs(subName, {
        ...defaultOptions,
        timeout: 1000
      }).resolves({
        canceled: true
      })

      const out = await cli(`name pubsub cancel ${subName} --timeout=1s`, { ipfs })

      expect(out).to.equal('canceled\n')
    })
  })

  describe('list', () => {
    const subName = 'sub-name'
    const defaultOptions = {
      timeout: undefined
    }

    it('should list subscriptions', async () => {
      ipfs.name.pubsub.subs.withArgs(defaultOptions).resolves([
        subName
      ])

      const out = await cli('name pubsub subs', { ipfs })

      expect(out).to.equal(`${subName}\n`)
    })

    it('should list subscriptions with a timeout', async () => {
      ipfs.name.pubsub.subs.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).resolves([
        subName
      ])

      const out = await cli('name pubsub subs --timeout=1s', { ipfs })

      expect(out).to.equal(`${subName}\n`)
    })

    it('should strip control characters when listing subscriptions', async () => {
      const junkSubname = `${subName}\n\b`

      ipfs.name.pubsub.subs.withArgs(defaultOptions).resolves([
        junkSubname
      ])

      const out = await cli('name pubsub subs', { ipfs })

      expect(out).to.equal(`${subName}\n`)
    })
  })
})
