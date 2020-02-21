/* eslint-env mocha */
'use strict'

const expect = require('../helpers/chai')
const cli = require('../helpers/cli')
const sinon = require('sinon')
const isNode = require('detect-node')

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
  const mtime = new Date(100000)
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        touch: sinon.stub()
      }
    }
  })

  it('should update the mtime for a file', async () => {
    await cli(`files touch -m ${mtime.getTime() / 1000} ${path}`, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        mtime
      })
    ])
  })

  it('should update the mtime without flushing', async () => {
    await cli(`files touch -m ${mtime.getTime() / 1000} --flush false ${path}`, { ipfs })

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
    await cli(`files touch -m ${mtime.getTime() / 1000} -f false ${path}`, { ipfs })

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
    await cli(`files touch -m ${mtime.getTime() / 1000} --hash-alg sha3-256 ${path}`, { ipfs })

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
    await cli(`files touch -m ${mtime.getTime() / 1000} -h sha3-256 ${path}`, { ipfs })

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
    await cli(`files touch -m ${mtime.getTime() / 1000} --shard-split-threshold 10 ${path}`, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        mtime,
        shardSplitThreshold: 10
      })
    ])
  })
})
