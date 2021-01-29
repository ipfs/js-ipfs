/* eslint-env mocha */
'use strict'

const sinon = require('sinon')
const server = require('./utils/server')
const { expect } = require('aegir/utils/chai')
const all = require('it-all')
const drain = require('it-drain')

describe('Root.id', () => {
  let ipfs
  let socket

  beforeEach(() => {
    ipfs = {
      id: sinon.stub()
    }
    socket = server({ ipfs })
  })

  it('should get the node id', async () => {
    const id = 'hello world ' + Math.random()

    ipfs.id.withArgs({}).resolves(id)

    const channel = socket.send('/ipfs.Root/id', {})
    channel.clientSend({})
    channel.clientEnd()

    const messages = await all(channel.clientSink)
    expect(messages).to.have.lengthOf(1)
    expect(messages).to.have.nested.property('[0]', id)
  })

  it('should get a different node id', async () => {
    const peerId = 'peer-id ' + Math.random()
    const id = 'hello world ' + Math.random()

    ipfs.id.withArgs({
      peerId
    }).resolves(id)

    const channel = socket.send('/ipfs.Root/id', {})
    channel.clientSend({
      peerId
    })
    channel.clientEnd()

    const messages = await all(channel.clientSink)
    expect(messages).to.have.lengthOf(1)
    expect(messages).to.have.nested.property('[0]', id)
  })

  it('should propagate error when getting id', async () => {
    const err = new Error('halp!')

    ipfs.id.rejects(err)

    const channel = socket.send('/ipfs.Root/id', {})
    channel.clientSend({})
    channel.clientEnd()

    await expect(drain(channel.clientSink)).to.eventually.be.rejectedWith(/halp!/)
  })
})
