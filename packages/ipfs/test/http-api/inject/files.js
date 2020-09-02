/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const randomBytes = require('iso-random-stream/src/random')
const { expect } = require('aegir/utils/chai')
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')
const multibase = require('multibase')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const CID = require('cids')
const first = require('it-first')
const toBuffer = require('it-to-buffer')
const { AbortSignal } = require('abort-controller')

function matchIterable () {
  return sinon.match((thing) => Boolean(thing[Symbol.asyncIterator]) || Boolean(thing[Symbol.iterator]))
}

describe('/files', () => {
  const cid = new CID('QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR')
  const cid2 = new CID('QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNA')
  let ipfs

  beforeEach(() => {
    ipfs = {
      addAll: sinon.stub(),
      cat: sinon.stub(),
      get: sinon.stub(),
      ls: sinon.stub(),
      refs: sinon.stub()
    }

    ipfs.refs.local = sinon.stub()
  })

  async function assertAddArgs (url, fn) {
    const content = Buffer.from('TEST\n')

    ipfs.addAll.callsFake(async function * (source, opts) {
      expect(fn(opts)).to.be.true()

      const input = await first(source)
      expect(await toBuffer(input.content)).to.deep.equal(content)

      yield {
        path: cid.toString(),
        cid,
        size: content.byteLength,
        mode: 0o420,
        mtime: {
          secs: 100,
          nsecs: 0
        }
      }
    })

    const form = new FormData()
    form.append('data', content)
    const headers = form.getHeaders()

    const payload = await streamToPromise(form)
    const res = await http({
      method: 'POST',
      url,
      headers,
      payload
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(JSON.parse(res.result).Hash).to.equal(cid.toString())
  }

  describe('/add', () => {
    const defaultOptions = {
      cidVersion: undefined,
      rawLeaves: undefined,
      progress: sinon.match.func,
      onlyHash: undefined,
      hashAlg: undefined,
      wrapWithDirectory: undefined,
      pin: undefined,
      chunker: undefined,
      trickle: undefined,
      preload: undefined,
      shardSplitThreshold: undefined,
      fileImportConcurrency: 1,
      blockWriteConcurrency: undefined,
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/add')
    })

    it('should add buffer bigger than Hapi default max bytes (1024 * 1024)', async () => {
      const payload = Buffer.from([
        '',
        '------------287032381131322',
        'Content-Disposition: form-data; name="test"; filename="test.txt"',
        'Content-Type: text/plain',
        '',
        randomBytes(1024 * 1024 * 2).toString('hex'),
        '------------287032381131322--'
      ].join('\r\n'))

      ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
        path: cid.toString(),
        cid,
        size: 1024 * 1024 * 2,
        mode: 0o420,
        mtime: {
          secs: 100,
          nsecs: 0
        }
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/add',
        headers: {
          'Content-Type': 'multipart/form-data; boundary=----------287032381131322'
        },
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })

    it('should add data and return a base64 encoded CID', async () => {
      const content = Buffer.from('TEST' + Date.now())

      ipfs.addAll.withArgs(matchIterable(), defaultOptions).returns([{
        path: cid.toString(),
        cid,
        size: content.byteLength,
        mode: 0o420,
        mtime: {
          secs: 100,
          nsecs: 0
        }
      }])

      const form = new FormData()
      form.append('data', content)
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/add?cid-base=base64',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(multibase.isEncoded(JSON.parse(res.result).Hash)).to.deep.equal('base64')
    })

    it('should add data without pinning and return a base64 encoded CID', async () => {
      const content = Buffer.from('TEST' + Date.now())

      ipfs.addAll.callsFake(async function * (source, opts) {
        expect(opts).to.have.property('pin', false)

        const input = await first(source)
        expect(await toBuffer(input.content)).to.deep.equal(content)

        yield {
          path: cid.toString(),
          cid,
          size: content.byteLength,
          mode: 0o420,
          mtime: {
            secs: 100,
            nsecs: 0
          }
        }
      })

      const form = new FormData()
      form.append('data', content)
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/add?cid-base=base64&pin=false',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(multibase.isEncoded(JSON.parse(res.result).Hash)).to.deep.equal('base64')
    })

    it('should specify the cid version', () => assertAddArgs('/api/v0/add?cid-version=1', (opts) => opts.cidVersion === 1))

    it('should specify raw leaves', () => assertAddArgs('/api/v0/add?raw-leaves=true', (opts) => opts.rawLeaves === true))

    it('should specify only hash', () => assertAddArgs('/api/v0/add?only-hash=true', (opts) => opts.onlyHash === true))

    it('should specify pin', () => assertAddArgs('/api/v0/add?pin=true', (opts) => opts.pin === true))

    it('should specify wrap with directory', () => assertAddArgs('/api/v0/add?wrap-with-directory=true', (opts) => opts.wrapWithDirectory === true))

    it('should ignore file import concurrency', () => assertAddArgs('/api/v0/add?file-import-concurrency=5', (opts) => opts.fileImportConcurrency === 1))

    it('should specify block write concurrency', () => assertAddArgs('/api/v0/add?block-write-concurrency=5', (opts) => opts.blockWriteConcurrency === 5))

    it('should specify shard split threshold', () => assertAddArgs('/api/v0/add?shard-split-threshold=5', (opts) => opts.shardSplitThreshold === 5))

    it('should specify chunker', () => assertAddArgs('/api/v0/add?chunker=derp', (opts) => opts.chunker === 'derp'))

    it('should add data using the trickle importer', () => assertAddArgs('/api/v0/add?trickle=true', (opts) => opts.trickle === true))

    it('should specify preload', () => assertAddArgs('/api/v0/add?preload=false', (opts) => opts.preload === false))
  })

  describe('/cat', () => {
    const defaultOptions = {
      offset: undefined,
      length: undefined,
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/cat')
    })

    it('returns 400 for request without argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/cat'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns 400 for request with invalid argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/cat?arg=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('should cat a valid hash', async function () {
      const data = Buffer.from('TEST' + Date.now())

      ipfs.cat.withArgs(`${cid}`, defaultOptions).returns([
        data
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/cat?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('rawPayload', data)
      expect(res).to.have.property('payload', data.toString())
    })

    it('should cat a valid hash with an offset', async function () {
      const data = Buffer.from('TEST' + Date.now())

      ipfs.cat.withArgs(`${cid}`, {
        ...defaultOptions,
        offset: 10
      }).returns([
        data
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/cat?arg=${cid}&offset=10`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('rawPayload', data)
      expect(res).to.have.property('payload', data.toString())
    })

    it('should cat a valid hash with a length', async function () {
      const data = Buffer.from('TEST' + Date.now())

      ipfs.cat.withArgs(`${cid}`, {
        ...defaultOptions,
        length: 10
      }).returns([
        data
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/cat?arg=${cid}&length=10`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('rawPayload', data)
      expect(res).to.have.property('payload', data.toString())
    })
  })

  describe('/get', () => {
    const defaultOptions = {
      archive: false,
      compress: false,
      compressionLevel: undefined,
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/get')
    })

    it('accepts a timeout', async () => {
      ipfs.get.withArgs(`${cid}`, {
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        path: 'path'
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/get?arg=${cid}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })
  })

  describe('/ls', () => {
    const defaultOptions = {
      recursive: false,
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/ls')
    })

    it('should list directory contents', async () => {
      ipfs.ls.withArgs(`${cid}`, defaultOptions).returns([{
        name: 'link',
        cid,
        size: 10,
        type: 'file',
        depth: 1,
        mode: 0o420
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/ls?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Objects[0]', {
        Hash: `${cid}`,
        Links: [{
          Depth: 1,
          Hash: cid.toString(),
          Mode: '0420',
          Name: 'link',
          Size: 10,
          Type: 2
        }]
      })
    })

    it('should list directory contents without unixfs v1.5 fields', async () => {
      ipfs.ls.withArgs(`${cid}`, defaultOptions).returns([{
        name: 'link',
        cid,
        size: 10,
        type: 'file',
        depth: 1
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/ls?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Objects[0]', {
        Hash: `${cid}`,
        Links: [{
          Depth: 1,
          Hash: cid.toString(),
          Name: 'link',
          Size: 10,
          Type: 2
        }]
      })
    })

    it('should list directory contents recursively', async () => {
      ipfs.ls.withArgs(`${cid}`, {
        ...defaultOptions,
        recursive: true
      }).returns([{
        name: 'link',
        cid,
        size: 10,
        type: 'file',
        depth: 1,
        mode: 0o420
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/ls?arg=${cid}&recursive=true`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Objects[0]', {
        Hash: `${cid}`,
        Links: [{
          Depth: 1,
          Hash: cid.toString(),
          Mode: '0420',
          Name: 'link',
          Size: 10,
          Type: 2
        }]
      })
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should return base64 encoded CIDs', async () => {
      ipfs.ls.withArgs(`${cid}`, defaultOptions).returns([])

      const res = await http({
        method: 'POST',
        url: `/api/v0/ls?cid-base=base64&arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Objects[0]', {
        Hash: cid.toV1().toString('base64'),
        Links: []
      })
    })

    it('accepts a timeout', async () => {
      ipfs.ls.withArgs(`${cid}`, {
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        name: 'link',
        cid,
        size: 10,
        type: 'file',
        depth: 1,
        mode: 0o420
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/ls?arg=${cid}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })

    it('accepts a timeout when streaming', async () => {
      ipfs.ls.withArgs(`${cid}`, {
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        name: 'link',
        cid,
        size: 10,
        type: 'file',
        depth: 1,
        mode: 0o420
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/ls?arg=${cid}&stream=true&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
    })
  })

  describe('/refs', () => {
    const defaultOptions = {
      recursive: false,
      format: '<dst>',
      edges: false,
      unique: false,
      maxDepth: undefined,
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/refs')
    })

    it('should list refs', async () => {
      ipfs.refs.withArgs([`${cid}`], {
        ...defaultOptions,
        format: '<linkname>'
      }).returns([{
        ref: cid.toString()
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/refs?format=<linkname>&arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(JSON.parse(res.result)).to.have.property('Ref', cid.toString())
    })

    it('should list refs for multiple IPFS paths', async () => {
      ipfs.refs.withArgs([`${cid}`, `/ipfs/${cid2}`], defaultOptions).returns([{
        ref: cid.toString()
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/refs?arg=${cid}&arg=/ipfs/${cid2}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(JSON.parse(res.result)).to.have.property('Ref', cid.toString())
    })

    it('accepts a timeout', async () => {
      ipfs.refs.withArgs([`${cid}`], {
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        ref: cid.toString()
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/refs?arg=${cid}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(JSON.parse(res.result)).to.have.property('Ref', cid.toString())
    })
  })

  describe('/refs/local', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/refs/local')
    })

    it('should list local refs', async () => {
      ipfs.refs.local.withArgs(defaultOptions).returns([{
        ref: cid.toString()
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/refs/local'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(JSON.parse(res.result)).to.have.property('Ref', cid.toString())
    })

    it('accepts a timeout', async () => {
      ipfs.refs.local.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        ref: cid.toString()
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/refs/local?timeout=1s'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(JSON.parse(res.result)).to.have.property('Ref', cid.toString())
    })
  })
})
