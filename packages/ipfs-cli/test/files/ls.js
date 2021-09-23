/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { isNode } from 'ipfs-utils/src/env.js'
import { CID } from 'multiformats/cid'
import { base58btc } from 'multiformats/bases/base58'
import { cli } from '../utils/cli.js'
const fileCid = CID.parse('bafybeigyov3nzxrqjismjpq7ghkkjorcmozy5rgaikvyieakoqpxfc3rvu')

const defaultOptions = {
  timeout: undefined
}

describe('ls', () => {
  if (!isNode) {
    return
  }

  let ipfs
  let print
  let output

  beforeEach(() => {
    output = ''
    ipfs = {
      files: {
        ls: sinon.stub().returns([])
      },
      bases: {
        getBase: sinon.stub()
      }
    }
    print = (msg = '', newline = true) => {
      output += newline ? msg + '\n' : msg
    }
  })

  it('should list a path', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const path = '/foo'

    await cli(`files ls ${path}`, { ipfs, print })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(ipfs.files.ls.getCall(0).args).to.deep.equal([
      path,
      defaultOptions
    ])
  })

  it('should list without a path', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    await cli('files ls', { ipfs, print })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(ipfs.files.ls.getCall(0).args).to.deep.equal([
      '/',
      defaultOptions
    ])
  })

  it('should list a path with details', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const files = [{
      cid: fileCid,
      name: 'file-name',
      size: 'file-size',
      mode: 0o755,
      mtime: {
        secs: Date.now() / 1000,
        nsecs: 0
      }
    }]

    ipfs.files.ls = sinon.stub().withArgs('/foo', defaultOptions).returns(files)

    await cli('files ls --long /foo', { ipfs, print })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(output).to.include(files[0].cid.toString(base58btc))
    expect(output).to.include(files[0].name)
    expect(output).to.include(files[0].size)
  })

  it('should list a path with details (short option)', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const files = [{
      cid: fileCid,
      name: 'file-name',
      size: 'file-size',
      mode: 0o755,
      mtime: {
        secs: Date.now() / 1000,
        nsecs: 0
      }
    }]

    ipfs.files.ls = sinon.stub().withArgs('/foo', defaultOptions).returns(files)

    await cli('files ls -l /foo', { ipfs, print })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(output).to.include(files[0].cid.toString(base58btc))
    expect(output).to.include(files[0].name)
    expect(output).to.include(files[0].size)
  })

  it('should list a path with a timeout', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const path = '/foo'

    await cli(`files ls ${path} --timeout=1s`, { ipfs, print })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(ipfs.files.ls.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        timeout: 1000
      }
    ])
  })

  it('should strip control characters from path names', async () => {
    ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

    const files = [{
      cid: fileCid,
      name: 'file\n\t\b-name',
      size: 'file-size',
      mode: 0o755,
      mtime: {
        secs: Date.now() / 1000,
        nsecs: 0
      }
    }]

    ipfs.files.ls = sinon.stub().withArgs('/foo', defaultOptions).returns(files)

    await cli('files ls --long /foo', { ipfs, print })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(output).to.include(files[0].cid.toString(base58btc))
    expect(output).to.include('file-name')
    expect(output).to.include(files[0].size)
  })
})
