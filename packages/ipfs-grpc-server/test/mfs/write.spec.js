/* eslint-env mocha */

import sinon from 'sinon'
import { server } from '../utils/server.js'
import { expect } from 'aegir/utils/chai.js'
import drain from 'it-drain'

describe('MFS.write', () => {
  let ipfs
  let socket

  before(() => {
    ipfs = {
      files: {
        write: sinon.stub()
      }
    }
    socket = server({ ipfs })
  })

  it('should write a file', async () => {
    const path = '/path'

    const channel = socket.send('/ipfs.MFS/write', {})
    channel.clientSend({ path })
    channel.clientEnd()

    await drain(channel.clientSink)

    expect(ipfs.files.write.calledWith(path)).to.be.true()
  })

  it('should propagate error when writing files', async () => {
    const path = '/path'
    const err = new Error('halp!')

    ipfs.files.write.withArgs(path).throws(err)

    const channel = socket.send('/ipfs.MFS/write', {})
    channel.clientSend({ path })
    channel.clientEnd()

    await expect(drain(channel.clientSink)).to.eventually.be.rejectedWith(/halp!/)
  })
})
