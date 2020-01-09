/* eslint-env mocha */
'use strict'

const expect = require('../helpers/chai')
const http = require('../helpers/http')
const sinon = require('sinon')
const PassThrough = require('stream').PassThrough

function defaultOptions (modification = {}) {
  const options = {
    offset: undefined,
    length: undefined
  }

  Object.keys(modification).forEach(key => {
    options[key] = modification[key]
  })

  return options
}

describe('read', () => {
  const path = '/foo'
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        readReadableStream: sinon.stub().callsFake(() => {
          const stream = new PassThrough()

          setImmediate(() => {
            stream.emit('data', Buffer.from('hello world'))
            stream.end()
          })

          return stream
        })
      }
    }
  })

  it('should read a path', async () => {
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/read?arg=${path}`
    }, { ipfs })

    expect(ipfs.files.readReadableStream.callCount).to.equal(1)
    expect(ipfs.files.readReadableStream.getCall(0).args).to.deep.equal([
      path,
      defaultOptions()
    ])
    expect(response).to.have.property('result', 'hello world')
  })

  it('should read a path with an offset', async () => {
    const offset = 5
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/read?arg=${path}&offset=${offset}`
    }, { ipfs })

    expect(ipfs.files.readReadableStream.callCount).to.equal(1)
    expect(ipfs.files.readReadableStream.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        offset
      })
    ])
    expect(response).to.have.property('result', 'hello world')
  })

  it('should read a path with a length', async () => {
    const length = 5
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/read?arg=${path}&length=${length}`
    }, { ipfs })

    expect(ipfs.files.readReadableStream.callCount).to.equal(1)
    expect(ipfs.files.readReadableStream.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        length
      })
    ])
    expect(response).to.have.property('result', 'hello world')
  })

  it('should read a path with count treated as length', async () => {
    const length = 5
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/read?arg=${path}&count=${length}`
    }, { ipfs })

    expect(ipfs.files.readReadableStream.callCount).to.equal(1)
    expect(ipfs.files.readReadableStream.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        length
      })
    ])
    expect(response).to.have.property('result', 'hello world')
  })
})
