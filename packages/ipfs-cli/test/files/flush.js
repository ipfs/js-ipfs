/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { CID } from 'multiformats/cid'
import { base58btc } from 'multiformats/bases/base58'
import { base64 } from 'multiformats/bases/base64'
import { cli } from '../utils/cli.js'
const cid = CID.parse('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')

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
      },
      bases: {
        getBase: sinon.stub()
      }
    }
    print = (msg = '', newline = true) => {
      output += newline ? msg + '\n' : msg
    }
  })

  it('should flush a path', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    await cli(`files flush ${path}`, { ipfs, print })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.getCall(0).args).to.deep.equal([
      path,
      defaultOptions
    ])
    expect(output).to.include(cid.toString())
  })

  it('should flush without a path', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    await cli('files flush', { ipfs, print })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.getCall(0).args).to.deep.equal([
      '/',
      defaultOptions
    ])
    expect(output).to.include(cid.toString())
  })

  it('should flush with a different CID base', async () => {
    ipfs.files.flush.returns(cid.toV1())
    ipfs.bases.getBase.withArgs('base64').returns(base64)

    await cli('files flush --cid-base base64', { ipfs, print })

    expect(ipfs.files.flush.callCount).to.equal(1)
    expect(ipfs.files.flush.getCall(0).args).to.deep.equal([
      '/',
      defaultOptions
    ])
    expect(output).to.include(cid.toV1().toString(base64))
  })

  it('should flush a path with a timeout', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

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
