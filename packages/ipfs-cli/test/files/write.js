/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { isNode } from 'ipfs-utils/src/env.js'
import { cli } from '../utils/cli.js'

const defaultOptions = {
  offset: undefined,
  length: undefined,
  create: false,
  truncate: false,
  rawLeaves: false,
  reduceSingleLeafToSelf: false,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  parents: false,
  strategy: 'balanced',
  flush: true,
  shardSplitThreshold: 1000,
  mode: undefined,
  mtime: undefined,
  timeout: undefined
}

describe('write', () => {
  if (!isNode) {
    return
  }

  const stdin = 'stdin'
  const getStdin = () => stdin
  let ipfs

  beforeEach(() => {
    ipfs = {
      files: {
        write: sinon.stub()
      }
    }
  })

  it('should write to a file', async () => {
    const path = '/foo'

    await cli(`files write ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin,
      defaultOptions
    ])
  })

  it('should write to a file and create parents', async () => {
    const path = '/foo'

    await cli(`files write --parents ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        parents: true
      }
    ])
  })

  it('should write to a file and create parents (short option)', async () => {
    const path = '/foo'

    await cli(`files write -p ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        parents: true
      }
    ])
  })

  it('should write to a file and create it', async () => {
    const path = '/foo'

    await cli(`files write --create ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        create: true
      }
    ])
  })

  it('should write to a file and create it (short option)', async () => {
    const path = '/foo'

    await cli(`files write -e ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        create: true
      }
    ])
  })

  it('should write to a file with an offset', async () => {
    const path = '/foo'

    await cli(`files write --offset 10 ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        offset: 10
      }
    ])
  })

  it('should write to a file with an offset (short option)', async () => {
    const path = '/foo'

    await cli(`files write -o 10 ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        offset: 10
      }
    ])
  })

  it('should write to a file with a length', async () => {
    const path = '/foo'

    await cli(`files write --length 10 ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        length: 10
      }
    ])
  })

  it('should write to a file with a length (short option)', async () => {
    const path = '/foo'

    await cli(`files write -l 10 ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        length: 10
      }
    ])
  })

  it('should write to a file and truncate it', async () => {
    const path = '/foo'

    await cli(`files write --truncate ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        truncate: true
      }
    ])
  })

  it('should write to a file and truncate it (short option)', async () => {
    const path = '/foo'

    await cli(`files write -t ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        truncate: true
      }
    ])
  })

  it('should write to a file with raw leaves', async () => {
    const path = '/foo'

    await cli(`files write --raw-leaves ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        rawLeaves: true
      }
    ])
  })

  it('should write to a file with raw leaves (short option)', async () => {
    const path = '/foo'

    await cli(`files write -r ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        rawLeaves: true
      }
    ])
  })

  it('should write to a file and reduce a single leaf to one node', async () => {
    const path = '/foo'

    await cli(`files write --reduce-single-leaf-to-self ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        reduceSingleLeafToSelf: true
      }
    ])
  })

  it('should write to a file without flushing', async () => {
    const path = '/foo'

    await cli(`files write --flush false ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        flush: false
      }
    ])
  })

  it('should write to a file without flushing (short option)', async () => {
    const path = '/foo'

    await cli(`files write -f false ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        flush: false
      }
    ])
  })

  it('should write to a file with a specified strategy', async () => {
    const path = '/foo'

    await cli(`files write --strategy trickle ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        strategy: 'trickle'
      }
    ])
  })

  it('should write to a file with a specified strategy (short option)', async () => {
    const path = '/foo'

    await cli(`files write -s trickle ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        strategy: 'trickle'
      }
    ])
  })

  it('should write to a file with a specified cid version', async () => {
    const path = '/foo'

    await cli(`files write --cid-version 5 ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        cidVersion: 5
      }
    ])
  })

  it('should write to a file with a specified cid version (shortish option)', async () => {
    const path = '/foo'

    await cli(`files write --cid-ver 5 ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        cidVersion: 5
      }
    ])
  })

  it('should write to a file with a specified hash algorithm', async () => {
    const path = '/foo'

    await cli(`files write --hash-alg sha3-256 ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        hashAlg: 'sha3-256'
      }
    ])
  })

  it('should write to a file with a specified hash algorithm (short option)', async () => {
    const path = '/foo'

    await cli(`files write -h sha3-256 ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        hashAlg: 'sha3-256'
      }
    ])
  })

  it('should write to a file with a specified shard split threshold', async () => {
    const path = '/foo'

    await cli(`files write --shard-split-threshold 10 ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        shardSplitThreshold: 10
      }
    ])
  })

  it('should write to a file with a specified mode', async () => {
    const path = '/foo'

    await cli(`files write --mode 0557 ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        mode: parseInt('0557', 8)
      }
    ])
  })

  it('should write to a file with a specified mtime', async () => {
    const path = '/foo'

    await cli(`files write --mtime 11 ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        mtime: {
          secs: 11,
          nsecs: undefined
        }
      }
    ])
  })

  it('should write to a file with a specified mtime and mtime nsecs', async () => {
    const path = '/foo'

    await cli(`files write --mtime 11 --mtime-nsecs 10 ${path}`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        mtime: {
          secs: 11,
          nsecs: 10
        }
      }
    ])
  })

  it('should write to a file with a timeout', async () => {
    const path = '/foo'

    await cli(`files write ${path} --timeout=1s`, { ipfs, getStdin })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0).args).to.deep.equal([
      path,
      stdin, {
        ...defaultOptions,
        timeout: 1000
      }
    ])
  })
})
