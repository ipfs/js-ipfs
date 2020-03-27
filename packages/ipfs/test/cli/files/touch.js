/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const cli = require('../../utils/cli')
const sinon = require('sinon')
const { isNode } = require('ipfs-utils/src/env')

function defaultOptions (modification = {}) {
  const options = {
    mtime: null,
    cidVersion: 0,
    hashAlg: 'sha2-256',
    flush: true,
    shardSplitThreshold: 1000
  }

  Object.keys(modification).forEach(key => {
    options[key] = modification[key]
  })

  return options
}

describe('touch', () => {
  if (!isNode) {
    return
  }

  const path = '/foo'
  const mtime = {
    secs: 1000
  }
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        touch: sinon.stub()
      }
    }
  })

  it('should update the mtime for a file', async () => {
    await cli(`files touch -m ${mtime.secs} ${path}`, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        mtime
      })
    ])
  })

  it('should update the mtime without flushing', async () => {
    await cli(`files touch -m ${mtime.secs} --flush false ${path}`, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        mtime,
        flush: false
      })
    ])
  })

  it('should update the mtime without flushing (short option)', async () => {
    await cli(`files touch -m ${mtime.secs} -f false ${path}`, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        mtime,
        flush: false
      })
    ])
  })

  it('should update the mtime with a different hash algorithm', async () => {
    await cli(`files touch -m ${mtime.secs} --hash-alg sha3-256 ${path}`, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        mtime,
        hashAlg: 'sha3-256'
      })
    ])
  })

  it('should update the mtime with a different hash algorithm (short option)', async () => {
    await cli(`files touch -m ${mtime.secs} -h sha3-256 ${path}`, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        mtime,
        hashAlg: 'sha3-256'
      })
    ])
  })

  it('should update the mtime with a shard split threshold', async () => {
    await cli(`files touch -m ${mtime.secs} --shard-split-threshold 10 ${path}`, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        mtime,
        shardSplitThreshold: 10
      })
    ])
  })

  it('should update the mtime and nsecs', async () => {
    await cli(`files touch -m 5 --mtime-nsecs 10 ${path}`, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        mtime: {
          secs: 5,
          nsecs: 10
        }
      })
    ])
  })
})
