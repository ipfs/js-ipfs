/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { cli } from '../utils/cli.js'

const defaultOptions = {
  recursive: false,
  hashAlg: 'sha2-256',
  flush: true,
  shardSplitThreshold: 1000,
  timeout: undefined
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
      mode,
      defaultOptions
    ])
  })

  it('should update the mode for a file with a string', async () => {
    await cli(`files chmod +x ${path}`, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      '+x',
      defaultOptions
    ])
  })

  it('should update the mode recursively', async () => {
    await cli(`files chmod ${mode} --recursive ${path}`, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      mode, {
        ...defaultOptions,
        recursive: true
      }
    ])
  })

  it('should update the mode recursively (short option)', async () => {
    await cli(`files chmod ${mode} -r ${path}`, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      mode, {
        ...defaultOptions,
        recursive: true
      }
    ])
  })

  it('should update the mode without flushing', async () => {
    await cli(`files chmod ${mode} --flush false ${path}`, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      mode, {
        ...defaultOptions,
        flush: false
      }
    ])
  })

  it('should update the mode without flushing (short option)', async () => {
    await cli(`files chmod ${mode} -f false ${path}`, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      mode, {
        ...defaultOptions,
        flush: false
      }
    ])
  })

  it('should update the mode a with different hash algorithm', async () => {
    await cli(`files chmod ${mode} --hash-alg sha3-256 ${path}`, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      mode, {
        ...defaultOptions,
        hashAlg: 'sha3-256'
      }
    ])
  })

  it('should update the mode a with different hash algorithm (short option)', async () => {
    await cli(`files chmod ${mode} -h sha3-256 ${path}`, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      mode, {
        ...defaultOptions,
        hashAlg: 'sha3-256'
      }
    ])
  })

  it('should update the mode with a shard split threshold', async () => {
    await cli('files chmod 0777 --shard-split-threshold 10 /foo', { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      mode, {
        ...defaultOptions,
        shardSplitThreshold: 10
      }
    ])
  })

  it('should update the mode with a timeout', async () => {
    await cli(`files chmod ${mode} ${path} --timeout=1s`, { ipfs })

    expect(ipfs.files.chmod.callCount).to.equal(1)
    expect(ipfs.files.chmod.getCall(0).args).to.deep.equal([
      path,
      mode, {
        ...defaultOptions,
        timeout: 1000
      }
    ])
  })
})
