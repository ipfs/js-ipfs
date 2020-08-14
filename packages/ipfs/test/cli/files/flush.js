/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const cli = require('../../utils/cli')
const sinon = require('sinon')
const CID = require('cids')
const cid = new CID('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')

const defaultOptions = {
  timeout: undefined
}

describe('flush', () => {
  const path = '/foo'
  let ipfs
  let print
  let output

  beforeEach(() => {
    ipfs = {
      files: {
        flush: sinon.stub().resolves(cid)
      }
    }
    print = (msg = '', newline = true) => {
      output += newline ? msg + '\n' : msg
    }
  })

  it('should flush a path', async () => {
    await cli(`files flush ${path}`, { ipfs, print })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.getCall(0).args).to.deep.equal([
      path,
      defaultOptions
    ])
    expect(output).to.include(cid.toString())
  })

  it('should flush without a path', async () => {
    await cli('files flush', { ipfs, print })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.getCall(0).args).to.deep.equal([
      '/',
      defaultOptions
    ])
    expect(output).to.include(cid.toString())
  })

  it('should flush with a different CID base', async () => {
    await cli('files flush --cid-base base64', { ipfs, print })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.getCall(0).args).to.deep.equal([
      '/',
      defaultOptions
    ])
    expect(output).to.include(cid.toV1().toString('base64'))
  })

  it('should flush a path with a timeout', async () => {
    await cli(`files flush ${path} --timeout=1s`, { ipfs, print })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        timeout: 1000
      }
    ])
    expect(output).to.include(cid.toString())
  })
})
