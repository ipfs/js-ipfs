/* eslint-env mocha */
'use strict'

const expect = require('../helpers/chai')
const http = require('../helpers/http')
const sinon = require('sinon')

function defaultOptions (modification = {}) {
  const options = {
    recursive: false,
    hashAlg: 'sha2-256',
    flush: true,
    shardSplitThreshold: 1000
  }

  Object.keys(modification).forEach(key => {
    options[key] = modification[key]
  })

  return options
}

describe('chmod', () => {
  const path = '/foo'
  const mode = '0654'
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        chmod: sinon.stub()
      }
    }
  })

  it('should update the mode for a file', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/chmod?arg=${path}&mode=${mode}`
    }, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      mode,
      defaultOptions()
    ])
  })

  it('should update the mode recursively', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/chmod?arg=${path}&mode=${mode}&recursive=true`
    }, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      mode,
      defaultOptions({
        recursive: true
      })
    ])
  })

  it('should update the mode without flushing', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/chmod?arg=${path}&mode=${mode}&flush=false`
    }, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      mode,
      defaultOptions({
        flush: false
      })
    ])
  })

  it('should update the mode a different hash algorithm', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/chmod?arg=${path}&mode=${mode}&hashAlg=sha3-256`
    }, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      mode,
      defaultOptions({
        hashAlg: 'sha3-256'
      })
    ])
  })

  it('should update the mode with a shard split threshold', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/chmod?arg=${path}&mode=${mode}&shardSplitThreshold=10`
    }, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      mode,
      defaultOptions({
        shardSplitThreshold: 10
      })
    ])
  })
})
