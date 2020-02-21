/* eslint-env mocha */
'use strict'

const expect = require('../helpers/chai')
const cli = require('../helpers/cli')
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
  const mode = '0777'
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        chmod: sinon.stub()
      }
    }
  })

  it('should update the mode for a file', async () => {
    await cli(`files chmod ${mode} ${path}`, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      parseInt(mode, 8),
      defaultOptions()
    ])
  })

  it('should update the mode recursively', async () => {
    await cli(`files chmod ${mode} --recursive ${path}`, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      parseInt(mode, 8),
      defaultOptions({
        recursive: true
      })
    ])
  })

  it('should update the mode recursively (short option)', async () => {
    await cli(`files chmod ${mode} -r ${path}`, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      parseInt(mode, 8),
      defaultOptions({
        recursive: true
      })
    ])
  })

  it('should update the mode without flushing', async () => {
    await cli(`files chmod ${mode} --flush false ${path}`, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      parseInt(mode, 8),
      defaultOptions({
        flush: false
      })
    ])
  })

  it('should update the mode without flushing (short option)', async () => {
    await cli(`files chmod ${mode} -f false ${path}`, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      parseInt(mode, 8),
      defaultOptions({
        flush: false
      })
    ])
  })

  it('should update the mode a with different hash algorithm', async () => {
    await cli(`files chmod ${mode} --hash-alg sha3-256 ${path}`, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      parseInt(mode, 8),
      defaultOptions({
        hashAlg: 'sha3-256'
      })
    ])
  })

  it('should update the mode a with different hash algorithm (short option)', async () => {
    await cli(`files chmod ${mode} -h sha3-256 ${path}`, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      parseInt(mode, 8),
      defaultOptions({
        hashAlg: 'sha3-256'
      })
    ])
  })

  it('should update the mode with a shard split threshold', async () => {
    await cli('files chmod 0777 --shard-split-threshold 10 /foo', { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      parseInt(mode, 8),
      defaultOptions({
        shardSplitThreshold: 10
      })
    ])
  })
})
