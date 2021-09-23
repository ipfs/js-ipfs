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
  timeout: undefined
}

describe('mv', () => {
  if (!isNode) {
    return
  }

  const source = '/src'
  const dest = '/dest'
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        mv: sinon.stub()
      }
    }
  })

  it('should move an entry', async () => {
    await cli(`files mv ${source} ${dest}`, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest,
      defaultOptions
    ])
  })

  it('should move an entry and create parents', async () => {
    await cli(`files mv --parents ${source} ${dest}`, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest, {
        ...defaultOptions,
        parents: true
      }
    ])
  })

  it('should move an entry and create parents (short option)', async () => {
    await cli(`files mv -p ${source} ${dest}`, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest, {
        ...defaultOptions,
        parents: true
      }
    ])
  })

  it('should make a directory with a different cid version', async () => {
    await cli(`files mv --cid-version 5 ${source} ${dest}`, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest, {
        ...defaultOptions,
        cidVersion: 5
      }
    ])
  })

  it('should make a directory with a different cid version (shortish option)', async () => {
    await cli(`files mv --cid-ver 5 ${source} ${dest}`, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest, {
        ...defaultOptions,
        cidVersion: 5
      }
    ])
  })

  it('should make a directory with a different hash algorithm', async () => {
    await cli(`files mv --hash-alg sha3-256 ${source} ${dest}`, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest, {
        ...defaultOptions,
        hashAlg: 'sha3-256'
      }
    ])
  })

  it('should make a directory with a different hash algorithm (short option)', async () => {
    await cli(`files mv -h sha3-256 ${source} ${dest}`, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest, {
        ...defaultOptions,
        hashAlg: 'sha3-256'
      }
    ])
  })

  it('should make a directory without flushing', async () => {
    await cli(`files mv --flush false ${source} ${dest}`, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest, {
        ...defaultOptions,
        flush: false
      }
    ])
  })

  it('should make a directory without flushing (short option)', async () => {
    await cli(`files mv -f false ${source} ${dest}`, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest, {
        ...defaultOptions,
        flush: false
      }
    ])
  })

  it('should make a directory a different shard split threshold', async () => {
    await cli(`files mv --shard-split-threshold 10 ${source} ${dest}`, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest, {
        ...defaultOptions,
        shardSplitThreshold: 10
      }
    ])
  })

  it('should move an entry with a timeout', async () => {
    await cli(`files mv ${source} ${dest} --timeout=1s`, { ipfs })

    expect(ipfs.files.mv.callCount).to.equal(1)
    expect(ipfs.files.mv.getCall(0).args).to.deep.equal([
      source,
      dest, {
        ...defaultOptions,
        timeout: 1000
      }
    ])
  })
})
