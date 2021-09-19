/* eslint-env mocha */

import sinon from 'sinon'
import { server } from './utils/server.js'
import { expect } from 'aegir/utils/chai.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import all from 'it-all'
import drain from 'it-drain'

describe('Root.add', () => {
  let ipfs
  let socket

  before(() => {
    ipfs = {
      addAll: sinon.stub()
    }
    socket = server({ ipfs })
  })

  it('should add files', async () => {
    const path1 = '/path/file-1.txt'
    const cid1 = 'cid-1'
    const path2 = '/path/file-1.txt'
    const cid2 = 'cid-2'

    const results = [{
      type: 'RESULT',
      path: path1,
      cid: cid1
    }, {
      type: 'RESULT',
      path: path2,
      cid: cid2
    }]

    ipfs.addAll.returns(results)

    const requests = [
      { index: 1, type: 'FILE', path: path1, content: uint8ArrayFromString('hello world') },
      { index: 1, type: 'FILE', path: path1 },
      { index: 2, type: 'FILE', path: path2, content: uint8ArrayFromString('hello world') },
      { index: 2, type: 'FILE', path: path2 }
    ]

    const channel = socket.send('/ipfs.Root/add', {})
    requests.forEach(request => channel.clientSend(request))
    channel.clientEnd()

    await expect(all(channel.clientSink)).to.eventually.deep.equal(results)
  })

  it('should propagate error when adding files', async () => {
    const path = '/path'
    const err = new Error('halp!')

    ipfs.addAll.throws(err)

    const channel = socket.send('/ipfs.Root/add', {})
    channel.clientSend({
      index: 1,
      type: 'DIRECTORY',
      path
    })
    channel.clientEnd()

    await expect(drain(channel.clientSink)).to.eventually.be.rejectedWith(/halp!/)
  })

  it('should propagate async error when adding files', async () => {
    const path = '/path'
    const err = new Error('halp!')

    ipfs.addAll.returns(async function * () {
      yield {
        type: 'file',
        name: 'name',
        cid: 'cid'
      }
      await Promise.resolve(true)
      throw err
    }())

    const channel = socket.send('/ipfs.Root/add', {})
    channel.clientSend({
      index: 1,
      type: 'DIRECTORY',
      path
    })
    channel.clientEnd()

    await expect(drain(channel.clientSink)).to.eventually.be.rejectedWith(/halp!/)
  })
})
