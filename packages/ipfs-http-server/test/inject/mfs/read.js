/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { http } from '../../utils/http.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import sinon from 'sinon'
import { testHttpMethod } from '../../utils/test-http-method.js'

const defaultOptions = {
  offset: undefined,
  length: undefined,
  timeout: undefined,
  signal: sinon.match.instanceOf(AbortSignal)
}

describe('/files/read', () => {
  const path = '/foo'
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        read: sinon.stub().returns([uint8ArrayFromString('hello world')])
      }
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod(`/api/v0/files/read?arg=${path}`, ipfs)
  })

  it('should read a path', async () => {
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/read?arg=${path}`
    }, { ipfs })

    expect(ipfs.files.read.callCount).to.equal(1)
    expect(ipfs.files.read.calledWith(path, defaultOptions)).to.be.true()
    expect(response).to.have.property('result', 'hello world')
  })

  it('should read a path with an offset', async () => {
    const offset = 5
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/read?arg=${path}&offset=${offset}`
    }, { ipfs })

    expect(ipfs.files.read.callCount).to.equal(1)
    expect(ipfs.files.read.calledWith(path, {
      ...defaultOptions,
      offset
    })).to.be.true()
    expect(response).to.have.property('result', 'hello world')
  })

  it('should read a path with a length', async () => {
    const length = 5
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/read?arg=${path}&length=${length}`
    }, { ipfs })

    expect(ipfs.files.read.callCount).to.equal(1)
    expect(ipfs.files.read.calledWith(path, {
      ...defaultOptions,
      length
    })).to.be.true()
    expect(response).to.have.property('result', 'hello world')
  })

  it('should read a path with count treated as length', async () => {
    const length = 5
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/read?arg=${path}&count=${length}`
    }, { ipfs })

    expect(ipfs.files.read.callCount).to.equal(1)
    expect(ipfs.files.read.callCount).to.equal(1)
    expect(ipfs.files.read.calledWith(path, {
      ...defaultOptions,
      length
    })).to.be.true()
    expect(response).to.have.property('result', 'hello world')
  })

  it('accepts a timeout', async () => {
    const response = await http({
      method: 'POST',
      url: `/api/v0/files/read?arg=${path}&timeout=1s`
    }, { ipfs })

    expect(ipfs.files.read.callCount).to.equal(1)
    expect(ipfs.files.read.callCount).to.equal(1)
    expect(ipfs.files.read.calledWith(path, {
      ...defaultOptions,
      timeout: 1000
    })).to.be.true()
    expect(response).to.have.property('result', 'hello world')
  })
})
