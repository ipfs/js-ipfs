/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import fs from 'fs'
import FormData from 'form-data'
import streamToPromise from 'stream-to-promise'
import { testHttpMethod } from '../utils/test-http-method.js'
import { http } from '../utils/http.js'
import sinon from 'sinon'
import { CID } from 'multiformats/cid'
import { UnixFS } from 'ipfs-unixfs'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { base58btc } from 'multiformats/bases/base58'
import { base64, base64pad } from 'multiformats/bases/base64'

describe('/object', () => {
  const cid = CID.parse('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
  const cid2 = CID.parse('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1a')
  const unixfs = new UnixFS({
    type: 'file'
  })
  const fileNode = {
    Data: unixfs.marshal(),
    Links: [{
      Name: '',
      Tsize: 5,
      Hash: cid
    }]
  }
  const emptyDirectoryNode = {
    Data: new UnixFS({
      type: 'directory'
    }).marshal(),
    Links: []
  }
  let ipfs

  beforeEach(() => {
    ipfs = {
      object: {
        new: sinon.stub(),
        get: sinon.stub(),
        put: sinon.stub(),
        stat: sinon.stub(),
        data: sinon.stub(),
        links: sinon.stub(),
        patch: {
          appendData: sinon.stub(),
          setData: sinon.stub(),
          addLink: sinon.stub(),
          rmLink: sinon.stub()
        }
      },
      bases: {
        getBase: sinon.stub()
      }
    }
  })

  describe('/new', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/object/new')
    })

    it('returns value', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.new.withArgs({
        ...defaultOptions,
        template: undefined
      }).returns(cid)
      ipfs.object.get.withArgs(cid, defaultOptions).returns(emptyDirectoryNode)

      const res = await http({
        method: 'POST',
        url: '/api/v0/object/new'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Hash', cid.toString())
      expect(res).to.have.nested.property('result.Links').that.is.empty()
    })

    it('should create an object with the passed template', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      const template = 'unixfs-dir'

      ipfs.object.new.withArgs({
        ...defaultOptions,
        template
      }).returns(cid)
      ipfs.object.get.withArgs(cid, defaultOptions).returns(emptyDirectoryNode)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/new?arg=${template}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Hash', cid.toString())
      expect(res).to.have.nested.property('result.Links').that.is.empty()
    })

    it('should not reate an object with an invalid template', async () => {
      const template = 'derp'

      ipfs.object.new.withArgs({
        ...defaultOptions,
        template
      }).returns(cid)
      ipfs.object.get.withArgs(cid, defaultOptions).returns(emptyDirectoryNode)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/new?arg=${template}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('should create a new object and return a base64 encoded CID', async () => {
      ipfs.bases.getBase.withArgs('base64').returns(base64)
      ipfs.object.new.withArgs({
        ...defaultOptions,
        template: undefined
      }).returns(cid.toV1())
      ipfs.object.get.withArgs(cid.toV1(), defaultOptions).returns(emptyDirectoryNode)

      const res = await http({
        method: 'POST',
        url: '/api/v0/object/new?cid-base=base64'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res.result.Hash).to.equal(cid.toV1().toString(base64))
    })

    it('accepts a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.new.withArgs({
        ...defaultOptions,
        template: undefined,
        timeout: 1000
      }).returns(cid)
      ipfs.object.get.withArgs(cid, {
        ...defaultOptions,
        timeout: 1000
      }).returns(emptyDirectoryNode)

      const res = await http({
        method: 'POST',
        url: '/api/v0/object/new?timeout=1s'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Hash', cid.toString())
      expect(res).to.have.nested.property('result.Links').that.is.empty()
    })
  })

  describe('/get', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/object/get')
    })

    it('returns 400 for request without argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/get'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns 400 for request with invalid argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/get?arg=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Code', 1)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns value', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.get.withArgs(cid, defaultOptions).returns(emptyDirectoryNode)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/get?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Links').that.is.empty()
      expect(res).to.have.nested.property('result.Data', uint8ArrayToString(emptyDirectoryNode.Data, 'base64pad'))
    })

    it('should get object and return a base64 encoded CID', async () => {
      ipfs.bases.getBase.withArgs('base64').returns(base64)
      ipfs.object.get.withArgs(cid.toV1(), defaultOptions).returns(emptyDirectoryNode)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/get?cid-base=base64&arg=${cid.toV1()}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res.result.Hash).to.equal(cid.toV1().toString(base64))
    })

    it('accepts a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.get.withArgs(cid, {
        ...defaultOptions,
        timeout: 1000
      }).returns(emptyDirectoryNode)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/get?arg=${cid}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Links').that.is.empty()
      expect(res).to.have.nested.property('result.Data', uint8ArrayToString(emptyDirectoryNode.Data, 'base64pad'))
    })
  })

  describe('/put', () => {
    const defaultOptions = {
      pin: false,
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/object/put')
    })

    it('returns 400 if no node is provided', async () => {
      const form = new FormData()
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/put',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('returns 400 if the node is invalid', async () => {
      ipfs.object.put.withArgs(sinon.match.instanceOf(Buffer), {
        ...defaultOptions,
        enc: 'json'
      }).throws(new Error('Bad node'))

      const form = new FormData()
      const filePath = 'test/fixtures/test-data/badnode.json'
      form.append('file', fs.createReadStream(filePath))
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/put?enc=json',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('puts value', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const pbNode = {
        Data: uint8ArrayFromString('another'),
        Links: [{
          Name: 'some link',
          Hash: CID.parse('QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V'),
          Tsize: 8
        }
        ]
      }

      ipfs.object.put.withArgs(pbNode, defaultOptions).returns(cid)
      ipfs.object.get.withArgs(cid).resolves(pbNode)

      const form = new FormData()
      form.append('data', Buffer.from(JSON.stringify({
        Data: Buffer.from('another').toString('base64'),
        Links: [{
          Name: 'some link',
          Hash: 'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V',
          Size: 8
        }
        ]
      })))
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/put',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('result', {
        Data: Buffer.from('another').toString('base64'),
        Hash: cid.toString(),
        Links: [{
          Name: 'some link',
          Hash: 'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V',
          Size: 8
        }],
        Size: 60
      })
    })

    it('should put data and return a base64 encoded CID', async () => {
      ipfs.bases.getBase.withArgs('base64').returns(base64)

      const pbNode = {
        Data: uint8ArrayFromString('another'),
        Links: [{
          Name: 'some link',
          Hash: CID.parse('QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V').toV1(),
          Tsize: 8
        }
        ]
      }

      ipfs.object.put.withArgs(pbNode, defaultOptions).returns(cid.toV1())
      ipfs.object.get.withArgs(cid.toV1()).resolves(pbNode)

      const form = new FormData()
      form.append('data', Buffer.from(JSON.stringify({
        Data: Buffer.from('another').toString('base64'),
        Links: [{
          Name: 'some link',
          Hash: CID.parse('QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V').toV1().toString(),
          Size: 8
        }
        ]
      })))
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/put?cid-base=base64',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('result', {
        Data: Buffer.from('another').toString('base64'),
        Hash: cid.toV1().toString(base64),
        Links: [{
          Name: 'some link',
          Hash: CID.parse('QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V').toV1().toString(base64),
          Size: 8
        }],
        Size: 62
      })
    })

    it('accepts a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const pbNode = {
        Data: uint8ArrayFromString('another'),
        Links: [{
          Name: 'some link',
          Hash: CID.parse('QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V'),
          Tsize: 8
        }
        ]
      }

      ipfs.object.put.withArgs(pbNode, {
        ...defaultOptions,
        timeout: 1000
      }).returns(cid)
      ipfs.object.get.withArgs(cid, {
        signal: sinon.match.instanceOf(AbortSignal),
        timeout: 1000
      }).resolves(pbNode)

      const form = new FormData()
      form.append('data', Buffer.from(JSON.stringify({
        Data: Buffer.from('another').toString('base64'),
        Links: [{
          Name: 'some link',
          Hash: 'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V',
          Size: 8
        }
        ]
      })))
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/put?timeout=1s',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('result', {
        Data: Buffer.from('another').toString('base64'),
        Hash: cid.toString(),
        Links: [{
          Name: 'some link',
          Hash: 'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V',
          Size: 8
        }],
        Size: 60
      })
    })
  })

  describe('/stat', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/object/stat')
    })

    it('returns 400 for request without argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/stat'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns 400 for request with invalid argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/stat?arg=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Code', 1)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns value', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.stat.withArgs(cid, defaultOptions).returns({
        Hash: cid,
        NumLinks: 'NumLinks',
        BlockSize: 'BlockSize',
        LinksSize: 'LinksSize',
        DataSize: 'DataSize',
        CumulativeSize: 'CumulativeSize'
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/stat?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Hash', cid.toString())
      expect(res).to.have.nested.property('result.NumLinks', 'NumLinks')
      expect(res).to.have.nested.property('result.BlockSize', 'BlockSize')
      expect(res).to.have.nested.property('result.LinksSize', 'LinksSize')
      expect(res).to.have.nested.property('result.DataSize', 'DataSize')
      expect(res).to.have.nested.property('result.CumulativeSize', 'CumulativeSize')
    })

    it('should stat object and return a base64 encoded CID', async () => {
      ipfs.bases.getBase.withArgs('base64').returns(base64)
      ipfs.object.stat.withArgs(cid, defaultOptions).returns({
        Hash: cid.toV1(),
        NumLinks: 'NumLinks',
        BlockSize: 'BlockSize',
        LinksSize: 'LinksSize',
        DataSize: 'DataSize',
        CumulativeSize: 'CumulativeSize'
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/stat?cid-base=base64&arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Hash', cid.toV1().toString(base64))
    })

    it('accepts a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.stat.withArgs(cid, {
        ...defaultOptions,
        timeout: 1000
      }).returns({
        Hash: cid,
        NumLinks: 'NumLinks',
        BlockSize: 'BlockSize',
        LinksSize: 'LinksSize',
        DataSize: 'DataSize',
        CumulativeSize: 'CumulativeSize'
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/stat?arg=${cid}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Hash', cid.toString())
      expect(res).to.have.nested.property('result.NumLinks', 'NumLinks')
      expect(res).to.have.nested.property('result.BlockSize', 'BlockSize')
      expect(res).to.have.nested.property('result.LinksSize', 'LinksSize')
      expect(res).to.have.nested.property('result.DataSize', 'DataSize')
      expect(res).to.have.nested.property('result.CumulativeSize', 'CumulativeSize')
    })
  })

  describe('/data', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/object/data')
    })

    it('returns 400 for request without argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/data'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns 400 for request with invalid argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/data?arg=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Code', 1)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns value', async () => {
      ipfs.object.data.withArgs(cid, defaultOptions).returns(emptyDirectoryNode.Data)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/data?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('rawPayload', emptyDirectoryNode.Data)
    })

    it('accepts a timeout', async () => {
      ipfs.object.data.withArgs(cid, {
        ...defaultOptions,
        timeout: 1000
      }).returns(emptyDirectoryNode.Data)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/data?arg=${cid}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('rawPayload', emptyDirectoryNode.Data)
    })
  })

  describe('/links', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/object/links')
    })

    it('returns 400 for request without argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/links'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns 400 for request with invalid argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/links?arg=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Code', 1)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns value', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.links.withArgs(cid, defaultOptions).returns(fileNode.Links)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/links?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('result', {
        Hash: cid.toString(),
        Links: [{
          Name: '',
          Hash: cid.toString(),
          Size: 5
        }]
      })
    })

    it('should list object links and return a base64 encoded CID', async () => {
      ipfs.bases.getBase.withArgs('base64').returns(base64)
      ipfs.object.links.withArgs(cid.toV1(), defaultOptions)
        .returns(fileNode.Links.map(l => ({
          ...l,
          Hash: l.Hash.toV1()
        })))

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/links?arg=${cid.toV1()}&cid-base=base64`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('result', {
        Hash: cid.toV1().toString(base64),
        Links: [{
          Name: '',
          Hash: cid.toV1().toString(base64),
          Size: 5
        }]
      })
    })

    it('accepts a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      ipfs.object.links.withArgs(cid, {
        ...defaultOptions,
        timeout: 1000
      }).returns(fileNode.Links)

      const expectedResult = {
        Hash: cid.toString(),
        Links: [{
          Name: '',
          Hash: cid.toString(),
          Size: 5
        }]
      }

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/links?arg=${cid}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('result', expectedResult)
    })
  })

  describe('/patch/append-data', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/object/patch/append-data')
    })

    it('returns 400 for request without key', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/patch/append-data'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns 400 if no data is provided', async () => {
      const form = new FormData()
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/patch/append-data?arg=QmVLUHkjGg3duGb5w3dnwK5w2P9QWuJmtVNuDPLc9ZDjzk',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('returns 400 for request with invalid key', async () => {
      const form = new FormData()
      const filePath = 'test/fixtures/test-data/badconfig'
      form.append('file', fs.createReadStream(filePath))
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/patch/append-data?arg=invalid',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('updates value', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      const data = Buffer.from('TEST' + Date.now())

      ipfs.object.patch.appendData.withArgs(cid, data, defaultOptions).returns(cid)
      ipfs.object.get.withArgs(cid).returns(emptyDirectoryNode)

      const form = new FormData()
      form.append('data', data)
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/append-data?arg=${cid}`,
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res.result).to.deep.equal({
        Data: base64pad.encode(emptyDirectoryNode.Data).substring(1),
        Hash: cid.toString(),
        Links: [],
        Size: 4
      })
    })

    it('should append data to object and return a base64 encoded CID', async () => {
      ipfs.bases.getBase.withArgs('base64').returns(base64)
      const data = Buffer.from('TEST' + Date.now())

      ipfs.object.patch.appendData.withArgs(cid.toV1(), data, defaultOptions).returns(cid.toV1())
      ipfs.object.get.withArgs(cid.toV1()).returns(emptyDirectoryNode)

      const form = new FormData()
      form.append('data', data)
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/append-data?arg=${cid.toV1()}&cid-base=base64`,
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res.result).to.deep.equal({
        Data: base64pad.encode(emptyDirectoryNode.Data).substring(1),
        Hash: cid.toV1().toString(base64),
        Links: [],
        Size: 4
      })
    })

    it('accepts a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      const data = Buffer.from('TEST' + Date.now())

      ipfs.object.patch.appendData.withArgs(cid, data, {
        ...defaultOptions,
        timeout: 1000
      }).returns(cid)
      ipfs.object.get.withArgs(cid).returns(emptyDirectoryNode)

      const form = new FormData()
      form.append('data', data)
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/append-data?arg=${cid}&timeout=1s`,
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res.result).to.deep.equal({
        Data: base64pad.encode(emptyDirectoryNode.Data).substring(1),
        Hash: cid.toString(),
        Links: [],
        Size: 4
      })
    })
  })

  describe('/patch/set-data', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/object/patch/set-data')
    })

    it('returns 400 for request without key', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/patch/set-data'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns 400 if no data is provided', async () => {
      const form = new FormData()
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/patch/set-data?arg=QmVLUHkjGg3duGb5w3dnwK5w2P9QWuJmtVNuDPLc9ZDjzk',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('returns 400 for request with invalid key', async () => {
      const form = new FormData()
      const filePath = 'test/fixtures/test-data/badconfig'
      form.append('file', fs.createReadStream(filePath))
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/patch/set-data?arg=invalid',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('updates value', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      const data = Buffer.from('TEST' + Date.now())

      ipfs.object.patch.setData.withArgs(cid, data, defaultOptions).returns(cid)
      ipfs.object.get.withArgs(cid).returns(emptyDirectoryNode)

      const form = new FormData()
      form.append('data', data)
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/set-data?arg=${cid}`,
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res.result).to.deep.equal({
        Hash: cid.toString(),
        Links: []
      })
    })

    it('should set data for object and return a base64 encoded CID', async () => {
      ipfs.bases.getBase.withArgs('base64').returns(base64)
      const data = Buffer.from('TEST' + Date.now())

      ipfs.object.patch.setData.withArgs(cid.toV1(), data, defaultOptions).returns(cid.toV1())
      ipfs.object.get.withArgs(cid.toV1()).returns(emptyDirectoryNode)

      const form = new FormData()
      form.append('data', data)
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/set-data?arg=${cid.toV1()}&cid-base=base64`,
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res.result).to.deep.equal({
        Hash: cid.toV1().toString(base64),
        Links: []
      })
    })

    it('accepts a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      const data = Buffer.from('TEST' + Date.now())

      ipfs.object.patch.setData.withArgs(cid, data, {
        ...defaultOptions,
        timeout: 1000
      }).returns(cid)
      ipfs.object.get.withArgs(cid).returns(emptyDirectoryNode)

      const form = new FormData()
      form.append('data', data)
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/set-data?arg=${cid}&timeout=1s`,
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res.result).to.deep.equal({
        Hash: cid.toString(),
        Links: []
      })
    })
  })

  describe('/patch/add-link', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/object/patch/add-link')
    })

    it('returns 400 for request without arguments', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/patch/add-link'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns 400 for request with only one invalid argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/patch/add-link?arg=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns 400 for request with invalid first argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/patch/add-link?arg=&arg=foo&arg=QmTz3oc4gdpRMKP2sdGUPZTAGRngqjsi99BPoztyP53JMM'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Code', 1)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns 400 for request with empty second argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/patch/add-link?arg=QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn&arg=&arg=QmTz3oc4gdpRMKP2sdGUPZTAGRngqjsi99BPoztyP53JMM'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Code', 1)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns value', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      const name = 'name'

      ipfs.object.patch.addLink.withArgs(cid, sinon.match({
        Name: name,
        Hash: cid2
      }), defaultOptions).returns(cid)
      ipfs.object.get.withArgs(cid).returns(fileNode)
      ipfs.object.get.withArgs(cid2).returns(fileNode)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/add-link?arg=${cid}&arg=${name}&arg=${cid2}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Hash', cid.toString())
      expect(res).to.have.deep.nested.property('result.Links[0]', {
        Name: '',
        Hash: cid.toString(),
        Size: 5
      })
    })

    it('should add a link to an object and return a base64 encoded CID', async () => {
      ipfs.bases.getBase.withArgs('base64').returns(base64)
      const name = 'name'

      ipfs.object.patch.addLink.withArgs(cid.toV1(), sinon.match({
        Name: name,
        Hash: cid2.toV1()
      }), defaultOptions).returns(cid.toV1())
      ipfs.object.get.withArgs(cid.toV1()).returns({
        ...fileNode,
        Links: fileNode.Links.map(l => ({
          ...l,
          Hash: l.Hash.toV1()
        }))
      })
      ipfs.object.get.withArgs(cid2.toV1()).returns({
        ...fileNode,
        Links: fileNode.Links.map(l => ({
          ...l,
          Hash: l.Hash.toV1()
        }))
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/add-link?arg=${cid.toV1()}&arg=${name}&arg=${cid2.toV1()}&cid-base=base64`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Hash', cid.toV1().toString(base64))
      expect(res).to.have.deep.nested.property('result.Links[0]', {
        Name: '',
        Hash: cid.toV1().toString(base64),
        Size: 5
      })
    })

    it('accepts a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      const name = 'name'

      ipfs.object.patch.addLink.withArgs(cid, sinon.match({
        Name: name,
        Hash: cid2
      }), {
        ...defaultOptions,
        timeout: 1000
      }).returns(cid)
      ipfs.object.get.withArgs(cid).returns(fileNode)
      ipfs.object.get.withArgs(cid2).returns(fileNode)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/add-link?arg=${cid}&arg=${name}&arg=${cid2}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Hash', cid.toString())
      expect(res).to.have.deep.nested.property('result.Links[0]', {
        Name: '',
        Hash: cid.toString(),
        Size: 5
      })
    })
  })

  describe('/patch/rm-link', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/object/patch/rm-link')
    })

    it('returns 400 for request without arguments', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/patch/rm-link'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns 400 for request with only one invalid argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/patch/rm-link?arg=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns 400 for request with invalid first argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/patch/rm-link?arg=invalid&arg=foo'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Code', 1)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns 400 for request with invalid second argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/patch/rm-link?arg=QmZKetgwm4o3LhNaoLSHv32wBhTwj9FBwAdSchDMKyFQEx&arg='
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Code', 1)
      expect(res).to.have.nested.property('result.Message').that.is.a('string')
    })

    it('returns value', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      const name = 'name'

      ipfs.object.patch.rmLink.withArgs(cid, name, {
        ...defaultOptions
      }).returns(cid2)
      ipfs.object.get.withArgs(cid2).returns(emptyDirectoryNode)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/rm-link?arg=${cid}&arg=${name}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Hash', cid2.toString())
    })

    it('should remove a link from an object and return a base64 encoded CID', async () => {
      ipfs.bases.getBase.withArgs('base64').returns(base64)
      const name = 'name'

      ipfs.object.patch.rmLink.withArgs(cid.toV1(), name, {
        ...defaultOptions
      }).returns(cid2.toV1())
      ipfs.object.get.withArgs(cid2.toV1()).returns(emptyDirectoryNode)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/rm-link?arg=${cid.toV1()}&arg=${name}&cid-base=base64`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Hash', cid2.toV1().toString(base64))
    })

    it('accepts a timeout', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      const name = 'name'

      ipfs.object.patch.rmLink.withArgs(cid, name, {
        ...defaultOptions,
        timeout: 1000
      }).returns(cid2)
      ipfs.object.get.withArgs(cid2).returns(emptyDirectoryNode)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/rm-link?arg=${cid}&arg=${name}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Hash', cid2.toString())
    })
  })
})
