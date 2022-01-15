/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { http } from '../../utils/http.js'
import { matchIterable } from '../../utils/match-iterable.js'
import sinon from 'sinon'
import FormData from 'form-data'
import streamToPromise from 'stream-to-promise'

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
  strategy: 'trickle',
  flush: true,
  shardSplitThreshold: 1000,
  mode: undefined,
  mtime: undefined,
  timeout: undefined,
  signal: sinon.match.instanceOf(AbortSignal)
}

async function send (text, options = {}) {
  let fieldName = 'file-0'
  const query = []

  if (options.mode) {
    query.push(`mode=${options.mode}`)
  }

  if (options.mtime) {
    query.push(`mtime=${options.mtime}`)
  }

  if (options.mtimeNsecs) {
    query.push(`mtime-nsecs=${options.mtimeNsecs}`)
  }

  if (query.length) {
    fieldName = `${fieldName}?${query.join('&')}`
  }

  const form = new FormData()
  form.append(fieldName, Buffer.from(text))

  return {
    headers: form.getHeaders(),
    payload: await streamToPromise(form)
  }
}

describe('/files/write', () => {
  const path = '/foo'
  let ipfs
  let content

  beforeEach(() => {
    content = Buffer.alloc(0)

    ipfs = {
      files: {
        write: sinon.stub().callsFake(async (path, input) => {
          for await (const buf of input) {
            content = Buffer.concat([content, buf])
          }

          content = content.toString('utf8')
        })
      }
    }
  })

  it('should write to a file', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.calledWith(path, matchIterable(), defaultOptions)).to.be.true()
    expect(content).to.equal('hello world')
  })

  it('should write to a file and create parents', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&parents=true`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.calledWith(path, matchIterable(), {
      ...defaultOptions,
      parents: true
    })).to.be.true()
    expect(content).to.equal('hello world')
  })

  it('should write to a file and create it', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&create=true`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.calledWith(path, matchIterable(), {
      ...defaultOptions,
      create: true
    })).to.be.true()
    expect(content).to.equal('hello world')
  })

  it('should write to a file with an offset', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&offset=10`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.calledWith(path, matchIterable(), {
      ...defaultOptions,
      offset: 10
    })).to.be.true()
    expect(content).to.equal('hello world')
  })

  it('should write to a file with a length', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&length=10`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.calledWith(path, matchIterable(), {
      ...defaultOptions,
      length: 10
    })).to.be.true()
    expect(content).to.equal('hello world')
  })

  it('should write to a file and truncate it', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&truncate=true`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.calledWith(path, matchIterable(), {
      ...defaultOptions,
      truncate: true
    })).to.be.true()
    expect(content).to.equal('hello world')
  })

  it('should write to a file with raw leaves', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&rawLeaves=true`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.calledWith(path, matchIterable(), {
      ...defaultOptions,
      rawLeaves: true
    })).to.be.true()
    expect(content).to.equal('hello world')
  })

  it('should write to a file and reduce a single leaf to one node', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&reduceSingleLeafToSelf=true`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.calledWith(path, matchIterable(), {
      ...defaultOptions,
      reduceSingleLeafToSelf: true
    })).to.be.true()
    expect(content).to.equal('hello world')
  })

  it('should write to a file without flushing', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&flush=false`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.calledWith(path, matchIterable(), {
      ...defaultOptions,
      flush: false
    })).to.be.true()
    expect(content).to.equal('hello world')
  })

  it('should write to a file with a specified strategy', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&strategy=flat`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.calledWith(path, matchIterable(), {
      ...defaultOptions,
      strategy: 'flat'
    })).to.be.true()
    expect(content).to.equal('hello world')
  })

  it('should write to a file with a specified cid version', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&cidVersion=1`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.calledWith(path, matchIterable(), {
      ...defaultOptions,
      cidVersion: 1
    })).to.be.true()
    expect(content).to.equal('hello world')
  })

  it('should write to a file with a specified hash algorithm', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&hashAlg=sha3-256`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.calledWith(path, matchIterable(), {
      ...defaultOptions,
      hashAlg: 'sha3-256'
    })).to.be.true()
    expect(content).to.equal('hello world')
  })

  it('should write to a file with a specified shard split threshold', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&shardSplitThreshold=10`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.calledWith(path, matchIterable(), {
      ...defaultOptions,
      shardSplitThreshold: 10
    })).to.be.true()
    expect(content).to.equal('hello world')
  })

  it('should write to a file with a specified mode', async () => {
    const mode = '0577'

    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}`,
      ...await send('hello world', {
        mode
      })
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.calledWith(path, matchIterable(), {
      ...defaultOptions,
      mode: parseInt(mode, 8)
    })).to.be.true()
    expect(content).to.equal('hello world')
  })

  it('should write to a file with a specified mtime', async () => {
    const mtime = 11

    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}`,
      ...await send('hello world', {
        mtime
      })
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.calledWith(path, matchIterable(), {
      ...defaultOptions,
      mtime: {
        secs: 11
      }
    })).to.be.true()
    expect(content).to.equal('hello world')
  })

  it('accepts a timeout', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&timeout=1s`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.calledWith(path, matchIterable(), {
      ...defaultOptions,
      timeout: 1000
    })).to.be.true()
    expect(content).to.equal('hello world')
  })
})
