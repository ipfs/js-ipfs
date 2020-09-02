/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const cli = require('../../utils/cli')
const sinon = require('sinon')
const { isNode } = require('ipfs-utils/src/env')
const CID = require('cids')
const fileCid = new CID('bafybeigyov3nzxrqjismjpq7ghkkjorcmozy5rgaikvyieakoqpxfc3rvu')

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
      }
    }
    print = (msg = '', newline = true) => {
      output += newline ? msg + '\n' : msg
    }
  })

  it('should list a path', async () => {
    const path = '/foo'

    await cli(`files ls ${path}`, { ipfs, print })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(ipfs.files.ls.getCall(0).args).to.deep.equal([
      path,
      defaultOptions
    ])
  })

  it('should list without a path', async () => {
    await cli('files ls', { ipfs, print })

    expect(ipfs.files.ls.callCount).to.equal(1)
    expect(ipfs.files.ls.getCall(0).args).to.deep.equal([
      '/',
      defaultOptions
    ])
  })

  it('should list a path with details', async () => {
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
    expect(output).to.include(files[0].cid.toString())
    expect(output).to.include(files[0].name)
    expect(output).to.include(files[0].size)
  })

  it('should list a path with details (short option)', async () => {
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
    expect(output).to.include(files[0].cid.toString())
    expect(output).to.include(files[0].name)
    expect(output).to.include(files[0].size)
  })

  it('should list a path with details', async () => {
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
    expect(output).to.include(files[0].cid.toString())
    expect(output).to.include(files[0].name)
    expect(output).to.include(files[0].size)
  })

  it('should list a path with details (short option)', async () => {
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
    expect(output).to.include(files[0].cid.toString())
    expect(output).to.include(files[0].name)
    expect(output).to.include(files[0].size)
  })

  it('should list a path with a timeout', async () => {
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
})
