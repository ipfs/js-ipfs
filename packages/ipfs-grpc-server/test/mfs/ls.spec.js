/* eslint-env mocha */

import sinon from 'sinon'
import { server } from '../utils/server.js'
import { expect } from 'aegir/utils/chai.js'
import all from 'it-all'
import drain from 'it-drain'

describe('MFS.ls', () => {
  let ipfs
  let socket

  before(() => {
    ipfs = {
      files: {
        ls: sinon.stub()
      }
    }
    socket = server({ ipfs })
  })

  it('should list files', async () => {
    const path = '/path'
    const results = [{
      type: 'file',
      name: 'file',
      cid: 'cid-1'
    }, {
      type: 'directory',
      name: 'dir',
      cid: 'cid-2'
    }]

    ipfs.files.ls.withArgs(path).returns(results)

    const channel = socket.send('/ipfs.MFS/ls', {})
    channel.clientSend({ path })
    channel.clientEnd()

    await expect(all(channel.clientSink)).to.eventually.deep.equal(results.map(result => ({
      ...result,
      type: result.type.toUpperCase()
    })))
  })

  it('should propagate error when listing files', async () => {
    const path = '/path'
    const err = new Error('halp!')

    ipfs.files.ls.withArgs(path).throws(err)

    const channel = socket.send('/ipfs.MFS/ls', {})
    channel.clientSend({ path })
    channel.clientEnd()

    await expect(drain(channel.clientSink)).to.eventually.be.rejectedWith(/halp!/)
  })

  it('should propagate async error when listing files', async () => {
    const path = '/path'
    const err = new Error('halp!')

    ipfs.files.ls.withArgs(path).returns(async function * () {
      yield {
        type: 'file',
        name: 'name',
        cid: 'cid'
      }
      await Promise.resolve(true)
      throw err
    }())

    const channel = socket.send('/ipfs.MFS/ls', {})
    channel.clientSend({ path })
    channel.clientEnd()

    await expect(drain(channel.clientSink)).to.eventually.be.rejectedWith(/halp!/)
  })
})
