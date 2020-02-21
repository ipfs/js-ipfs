/* eslint-env mocha */
'use strict'

const expect = require('../helpers/chai')
const http = require('../helpers/http')
const sinon = require('sinon')

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
  const path = '/foo'
  const mtime = new Date(1000000)
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        touch: sinon.stub()
      }
    }
  })

  it('should update the mtime for a file', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/touch?arg=${path}&mtime=${mtime.getTime() / 1000}`
    }, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        mtime: {
          secs: 1000
        }
      })
    ])
  })

  it('should update the mtime without flushing', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/touch?arg=${path}&mtime=${mtime.getTime() / 1000}&flush=false`
    }, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        mtime: {
          secs: 1000
        },
        flush: false
      })
    ])
  })

  it('should update the mtime with a different hash algorithm', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/touch?arg=${path}&mtime=${mtime.getTime() / 1000}&hashAlg=sha3-256`
    }, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        mtime: {
          secs: 1000
        },
        hashAlg: 'sha3-256'
      })
    ])
  })

  it('should update the mtime with a shard split threshold', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/touch?arg=${path}&mtime=${mtime.getTime() / 1000}&shardSplitThreshold=10`
    }, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        mtime: {
          secs: 1000
        },
        shardSplitThreshold: 10
      })
    ])
  })

  it('should update the mtime with nanoseconds with a shard split threshold', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/touch?arg=${path}&mtime=${mtime.getTime() / 1000}&mtimeNsecs=100&shardSplitThreshold=10`
    }, { ipfs })

    expect(ipfs.files.touch.callCount).to.equal(1)
    expect(ipfs.files.touch.getCall(0).args).to.deep.equal([
      path,
      defaultOptions({
        mtime: {
          secs: 1000,
          nsecs: 100
        },
        shardSplitThreshold: 10
      })
    ])
  })
})
