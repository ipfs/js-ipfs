/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { cli } from './utils/cli.js'
import sinon from 'sinon'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

describe('pubsub', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      pubsub: {
        ls: sinon.stub(),
        peers: sinon.stub(),
        publish: sinon.stub(),
        subscribe: sinon.stub()
      }
    }
  })

  describe('ls', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should list subscriptions', async () => {
      const subName = 'sub-name'

      ipfs.pubsub.ls.withArgs(defaultOptions).resolves([
        subName
      ])

      const out = await cli('pubsub ls', { ipfs })
      expect(out).to.equal(`${subName}\n`)
    })

    it('should list subscriptions with timeout', async () => {
      const subName = 'sub-name'

      ipfs.pubsub.ls.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).resolves([
        subName
      ])

      const out = await cli('pubsub ls --timeout=1s', { ipfs })
      expect(out).to.equal(`${subName}\n`)
    })

    it('should strip control characters from sub names', async () => {
      const subName = 'sub-name'
      const junkSubName = 'sub-nam\b\te\n'

      ipfs.pubsub.ls.withArgs(defaultOptions).resolves([
        junkSubName
      ])

      const out = await cli('pubsub ls', { ipfs })
      expect(out).to.equal(`${subName}\n`)
    })
  })

  describe('peers', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should list topic peers', async () => {
      const subName = 'sub-name'
      const peer = 'peer-id'

      ipfs.pubsub.peers.withArgs(subName, defaultOptions).resolves([
        peer
      ])

      const out = await cli(`pubsub peers ${subName}`, { ipfs })
      expect(out).to.equal(`${peer}\n`)
    })

    it('should list topic peers with a timeout', async () => {
      const subName = 'sub-name'
      const peer = 'peer-id'

      ipfs.pubsub.peers.withArgs(subName, {
        ...defaultOptions,
        timeout: 1000
      }).resolves([
        peer
      ])

      const out = await cli(`pubsub peers ${subName} --timeout=1s`, { ipfs })
      expect(out).to.equal(`${peer}\n`)
    })
  })

  describe('pub', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should publish message', async () => {
      const subName = 'sub-name-1'
      const data = 'data\r\nfirst\nZażółć gęślą jaźń😇'

      await cli(`pubsub pub ${subName} "${data}"`, { ipfs })

      expect(ipfs.pubsub.publish.calledWith(subName, uint8ArrayFromString(data), defaultOptions)).to.be.true()
    })

    it('should publish message with timeout', async () => {
      const subName = 'sub-name-2'
      const data = 'data\r\nsecond\nZażółć gęślą jaźń😇'

      await cli(`pubsub pub ${subName} "${data}" --timeout=1s`, { ipfs })

      expect(ipfs.pubsub.publish.calledWith(subName, uint8ArrayFromString(data), {
        ...defaultOptions,
        timeout: 1000
      })).to.be.true()
    })
  })

  describe('sub', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('should subscribe', async () => {
      const subName = 'sub\nname'

      await cli(`pubsub sub "${subName}"`, { ipfs })

      expect(ipfs.pubsub.subscribe.calledWith(subName, sinon.match.func, defaultOptions)).to.be.true()
    })

    it('should subscribe with a timeout', async () => {
      const subName = 'sub-name'

      await cli(`pubsub sub "${subName}" --timeout=1s`, { ipfs })

      expect(ipfs.pubsub.subscribe.calledWith(subName, sinon.match.func, {
        ...defaultOptions,
        timeout: 1000
      })).to.be.true()
    })
  })
})
