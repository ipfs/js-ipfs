/* eslint-env mocha */
'use strict'

const expect = require('../helpers/chai')
const cli = require('../helpers/cli')
const sinon = require('sinon')
const CID = require('cids')
const cid = new CID('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')

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
      {}
    ])
    expect(output).to.include(cid.toString())
  })

  it('should flush without a path', async () => {
    await cli('files flush', { ipfs, print })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.getCall(0).args).to.deep.equal([
      '/',
      {}
    ])
    expect(output).to.include(cid.toString())
  })

  it('should flush with a different CID base', async () => {
    await cli('files flush --cid-base base64', { ipfs, print })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.getCall(0).args).to.deep.equal([
      '/',
      {}
    ])
    expect(output).to.include(cid.toV1().toString('base64'))
  })
})
