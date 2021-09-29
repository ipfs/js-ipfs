/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { cli } from '../utils/cli.js'

const defaultOptions = {
  parents: false,
  hashAlg: 'sha2-256',
  flush: true,
  shardSplitThreshold: 1000,
  timeout: undefined
}

describe('cp', () => {
  const source = 'source'
  const dest = 'dest'
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        cp: sinon.stub()
      }
    }
  })

  it('should copy files', async () => {
    await cli(`files cp ${source} ${dest}`, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.getCall(0).args).to.deep.equal([
      source,
      dest,
      defaultOptions
    ])
  })

  it('should copy files and create intermediate directories', async () => {
    await cli(`files cp --parents ${source} ${dest}`, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.getCall(0).args).to.deep.equal([
      source,
      dest, {
        ...defaultOptions,
        parents: true
      }
    ])
  })

  it('should copy files and create intermediate directories (short option)', async () => {
    await cli(`files cp --parents ${source} ${dest}`, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.getCall(0).args).to.deep.equal([
      source,
      dest, {
        ...defaultOptions,
        parents: true
      }
    ])
  })

  it('should copy files with a different hash algorithm', async () => {
    await cli(`files cp --hash-alg sha3-256 ${source} ${dest}`, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.getCall(0).args).to.deep.equal([
      source,
      dest, {
        ...defaultOptions,
        hashAlg: 'sha3-256'
      }
    ])
  })

  it('should copy files with a different hash algorithm (short option)', async () => {
    await cli(`files cp -h sha3-256 ${source} ${dest}`, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.getCall(0).args).to.deep.equal([
      source,
      dest, {
        ...defaultOptions,
        hashAlg: 'sha3-256'
      }
    ])
  })

  it('should copy files with a different shard split threshold', async () => {
    await cli(`files cp --shard-split-threshold 10 ${source} ${dest}`, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.getCall(0).args).to.deep.equal([
      source,
      dest, {
        ...defaultOptions,
        shardSplitThreshold: 10
      }
    ])
  })

  it('should copy files with a timeout', async () => {
    await cli(`files cp ${source} ${dest} --timeout=1s`, { ipfs })

    expect(ipfs.files.cp.callCount).to.equal(1)
    expect(ipfs.files.cp.getCall(0).args).to.deep.equal([
      source,
      dest, {
        ...defaultOptions,
        timeout: 1000
      }
    ])
  })
})
