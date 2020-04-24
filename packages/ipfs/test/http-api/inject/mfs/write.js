/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const http = require('../../../utils/http')
const sinon = require('sinon')
const { Buffer } = require('buffer')
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')

function defaultOptions (modification = {}) {
  const options = {
    offset: undefined,
    length: undefined,
    create: false,
    truncate: false,
    rawLeaves: false,
    reduceSingleLeafToSelf: false,
    cidVersion: 0,
    hashAlg: 'sha2-256',
    parents: false,
    progress: undefined,
    strategy: 'trickle',
    flush: true,
    shardSplitThreshold: 1000,
    mode: undefined,
    mtime: undefined
  }

  Object.keys(modification).forEach(key => {
    options[key] = modification[key]
  })

  return options
}

async function send (text, headers = {}) {
  const form = new FormData()
  form.append('file-0', Buffer.from(text), {
    header: headers
  })

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
    expect(ipfs.files.write.getCall(0)).to.have.nested.property('args[0]', path)
    expect(ipfs.files.write.getCall(0)).to.have.nested.deep.property('args[2]', defaultOptions())
    expect(content).to.equal('hello world')
  })

  it('should write to a file and create parents', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&parents=true`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0)).to.have.nested.property('args[0]', path)
    expect(ipfs.files.write.getCall(0)).to.have.nested.deep.property('args[2]', defaultOptions({
      parents: true
    }))
    expect(content).to.equal('hello world')
  })

  it('should write to a file and create it', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&create=true`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0)).to.have.nested.property('args[0]', path)
    expect(ipfs.files.write.getCall(0)).to.have.nested.deep.property('args[2]', defaultOptions({
      create: true
    }))
    expect(content).to.equal('hello world')
  })

  it('should write to a file with an offset', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&offset=10`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0)).to.have.nested.property('args[0]', path)
    expect(ipfs.files.write.getCall(0)).to.have.nested.deep.property('args[2]', defaultOptions({
      offset: 10
    }))
    expect(content).to.equal('hello world')
  })

  it('should write to a file with a length', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&length=10`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0)).to.have.nested.property('args[0]', path)
    expect(ipfs.files.write.getCall(0)).to.have.nested.deep.property('args[2]', defaultOptions({
      length: 10
    }))
    expect(content).to.equal('hello world')
  })

  it('should write to a file and truncate it', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&truncate=true`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0)).to.have.nested.property('args[0]', path)
    expect(ipfs.files.write.getCall(0)).to.have.nested.deep.property('args[2]', defaultOptions({
      truncate: true
    }))
    expect(content).to.equal('hello world')
  })

  it('should write to a file with raw leaves', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&rawLeaves=true`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0)).to.have.nested.property('args[0]', path)
    expect(ipfs.files.write.getCall(0)).to.have.nested.deep.property('args[2]', defaultOptions({
      rawLeaves: true
    }))
    expect(content).to.equal('hello world')
  })

  it('should write to a file and reduce a single leaf to one node', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&reduceSingleLeafToSelf=true`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0)).to.have.nested.property('args[0]', path)
    expect(ipfs.files.write.getCall(0)).to.have.nested.deep.property('args[2]', defaultOptions({
      reduceSingleLeafToSelf: true
    }))
    expect(content).to.equal('hello world')
  })

  it('should write to a file without flushing', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&flush=false`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0)).to.have.nested.property('args[0]', path)
    expect(ipfs.files.write.getCall(0)).to.have.nested.deep.property('args[2]', defaultOptions({
      flush: false
    }))
    expect(content).to.equal('hello world')
  })

  it('should write to a file with a specified strategy', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&strategy=flat`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0)).to.have.nested.property('args[0]', path)
    expect(ipfs.files.write.getCall(0)).to.have.nested.deep.property('args[2]', defaultOptions({
      strategy: 'flat'
    }))
    expect(content).to.equal('hello world')
  })

  it('should write to a file with a specified cid version', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&cidVersion=1`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0)).to.have.nested.property('args[0]', path)
    expect(ipfs.files.write.getCall(0)).to.have.nested.deep.property('args[2]', defaultOptions({
      cidVersion: 1
    }))
    expect(content).to.equal('hello world')
  })

  it('should write to a file with a specified hash algorithm', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&hashAlg=sha3-256`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0)).to.have.nested.property('args[0]', path)
    expect(ipfs.files.write.getCall(0)).to.have.nested.deep.property('args[2]', defaultOptions({
      hashAlg: 'sha3-256'
    }))
    expect(content).to.equal('hello world')
  })

  it('should write to a file with a specified shard split threshold', async () => {
    await http({
      method: 'POST',
      url: `/api/v0/files/write?arg=${path}&shardSplitThreshold=10`,
      ...await send('hello world')
    }, { ipfs })

    expect(ipfs.files.write.callCount).to.equal(1)
    expect(ipfs.files.write.getCall(0)).to.have.nested.property('args[0]', path)
    expect(ipfs.files.write.getCall(0)).to.have.nested.deep.property('args[2]', defaultOptions({
      shardSplitThreshold: 10
    }))
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
    expect(ipfs.files.write.getCall(0)).to.have.nested.property('args[0]', path)
    expect(ipfs.files.write.getCall(0)).to.have.nested.deep.property('args[2]', defaultOptions({
      mode: parseInt(mode, 8)
    }))
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
    expect(ipfs.files.write.getCall(0)).to.have.nested.property('args[0]', path)
    expect(ipfs.files.write.getCall(0)).to.have.nested.deep.property('args[2]', defaultOptions({
      mtime: {
        secs: 11
      }
    }))
    expect(content).to.equal('hello world')
  })
})
