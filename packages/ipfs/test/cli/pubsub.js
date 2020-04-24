/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const cli = require('../utils/cli')
const sinon = require('sinon')
const { Buffer } = require('buffer')

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

  it('ls', async () => {
    const subName = 'sub-name'

    ipfs.pubsub.ls.resolves([
      subName
    ])

    const out = await cli('pubsub ls', { ipfs })
    expect(out).to.equal(`${subName}\n`)
  })

  it('peers', async () => {
    const subName = 'sub-name'
    const peer = 'peer-id'

    ipfs.pubsub.peers.withArgs(subName).resolves([
      peer
    ])

    const out = await cli(`pubsub peers ${subName}`, { ipfs })
    expect(out).to.equal(`${peer}\n`)
  })

  it('pub', async () => {
    const subName = 'sub-name'
    const data = 'data'

    await cli(`pubsub pub ${subName} ${data}`, { ipfs })

    expect(ipfs.pubsub.publish.calledWith(subName, Buffer.from(data))).to.be.true()
  })

  it('sub', async () => {
    const subName = 'sub-name'

    await cli(`pubsub sub ${subName}`, { ipfs })

    expect(ipfs.pubsub.subscribe.calledWith(subName, sinon.match.func)).to.be.true()
  })
})
