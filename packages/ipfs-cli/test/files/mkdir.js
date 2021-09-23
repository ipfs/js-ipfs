/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { isNode } from 'ipfs-utils/src/env.js'
import { cli } from '../utils/cli.js'

const defaultOptions = {
  parents: false,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  flush: true,
  shardSplitThreshold: 1000,
  mode: undefined,
  mtime: undefined,
  timeout: undefined
}

describe('mkdir', () => {
  if (!isNode) {
    return
  }

  const path = '/foo'
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        mkdir: sinon.stub()
      }
    }
  })

  it('should make a directory', async () => {
    await cli(`files mkdir ${path}`, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.getCall(0).args).to.deep.equal([
      path,
      defaultOptions
    ])
  })

  it('should make a directory with parents', async () => {
    await cli(`files mkdir --parents ${path}`, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        parents: true
      }
    ])
  })

  it('should make a directory with parents (short option)', async () => {
    await cli(`files mkdir -p ${path}`, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        parents: true
      }
    ])
  })

  it('should make a directory with a different cid version', async () => {
    await cli(`files mkdir --cid-version 5 ${path}`, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        cidVersion: 5
      }
    ])
  })

  it('should make a directory with a different cid version (shortish option)', async () => {
    await cli(`files mkdir --cid-ver 5 ${path}`, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        cidVersion: 5
      }
    ])
  })

  it('should make a directory with a different hash algorithm', async () => {
    await cli(`files mkdir --hash-alg sha3-256 ${path}`, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        hashAlg: 'sha3-256'
      }
    ])
  })

  it('should make a directory with a different hash algorithm (short option)', async () => {
    await cli(`files mkdir -h sha3-256 ${path}`, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        hashAlg: 'sha3-256'
      }
    ])
  })

  it('should make a directory without flushing', async () => {
    await cli(`files mkdir --flush false ${path}`, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        flush: false
      }
    ])
  })

  it('should make a directory without flushing (short option)', async () => {
    await cli(`files mkdir -f false ${path}`, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        flush: false
      }
    ])
  })

  it('should make a directory a different shard split threshold', async () => {
    await cli(`files mkdir --shard-split-threshold 10 ${path}`, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        shardSplitThreshold: 10
      }
    ])
  })

  it('should make a directory a different mode', async () => {
    await cli(`files mkdir --mode 0111 ${path}`, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        mode: parseInt('0111', 8)
      }
    ])
  })

  it('should make a directory a different mtime', async () => {
    await cli(`files mkdir --mtime 5 ${path}`, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        mtime: {
          secs: 5,
          nsecs: undefined
        }
      }
    ])
  })

  it('should make a directory a different mtime and mtime nsecs', async () => {
    await cli(`files mkdir --mtime 5 --mtime-nsecs 10 ${path}`, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        mtime: {
          secs: 5,
          nsecs: 10
        }
      }
    ])
  })

  it('should make a directory with a timeout', async () => {
    await cli(`files mkdir ${path} --timeout=1s`, { ipfs })

    expect(ipfs.files.mkdir.callCount).to.equal(1)
    expect(ipfs.files.mkdir.getCall(0).args).to.deep.equal([
      path, {
        ...defaultOptions,
        timeout: 1000
      }
    ])
  })
})
