/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const fs = require('fs')
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')
const multibase = require('multibase')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const CID = require('cids')
const { Buffer } = require('buffer')
const UnixFS = require('ipfs-unixfs')
const {
  DAGNode,
  DAGLink
} = require('ipld-dag-pb')

describe('/object', () => {
  const cid = new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
  const cid2 = new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1a')
  const unixfs = new UnixFS({
    type: 'file'
  })
  const fileNode = new DAGNode(unixfs.marshal(), [
    new DAGLink('', 5, cid)
  ])
  const emptyDirectoryNode = new DAGNode(new UnixFS({
    type: 'directory'
  }).marshal())
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
      }
    }
  })

  describe('/new', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/object/new')
    })

    it('returns value', async () => {
      ipfs.object.new.withArgs(undefined).returns(cid)
      ipfs.object.get.withArgs(cid).returns(emptyDirectoryNode)

      const res = await http({
        method: 'POST',
        url: '/api/v0/object/new'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Hash', cid.toString())
      expect(res).to.have.nested.property('result.Links').that.is.empty()
    })

    it('should create an object with the passed template', async () => {
      const template = 'template'

      ipfs.object.new.withArgs(template).returns(cid)
      ipfs.object.get.withArgs(cid).returns(emptyDirectoryNode)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/new?arg=${template}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Hash', cid.toString())
      expect(res).to.have.nested.property('result.Links').that.is.empty()
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should create a new object and return a base64 encoded CID', async () => {
      ipfs.object.new.withArgs(undefined).returns(cid)
      ipfs.object.get.withArgs(cid).returns(emptyDirectoryNode)

      const res = await http({
        method: 'POST',
        url: '/api/v0/object/new?cid-base=base64'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
    })

    it('should not create a new object for invalid cid-base option', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/new?cid-base=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })
  })

  describe('/get', () => {
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
      ipfs.object.get.withArgs(cid).returns(emptyDirectoryNode)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/get?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Links').that.is.empty()
      expect(res).to.have.nested.property('result.Data', emptyDirectoryNode.Data.toString())
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should get object and return a base64 encoded CID', async () => {
      ipfs.object.get.withArgs(cid).returns(emptyDirectoryNode)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/get?cid-base=base64&arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
    })

    it('should not get an object for invalid cid-base option', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/get?cid-base=invalid&arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })
  })

  describe('/put', () => {
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
      const form = new FormData()
      const filePath = 'test/fixtures/test-data/badnode.json'
      form.append('file', fs.createReadStream(filePath))
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

    it('updates value', async () => {
      ipfs.object.put.returns(cid)

      const form = new FormData()
      const filePath = 'test/fixtures/test-data/node.json'
      form.append('data', fs.createReadStream(filePath))
      const headers = form.getHeaders()

      const expectedResult = {
        Data: Buffer.from('another'),
        Hash: cid.toString(),
        Links: [{
          Name: 'some link',
          Hash: 'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V',
          Size: 8
        }],
        Size: 68
      }

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/put',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('result', expectedResult)
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should put data and return a base64 encoded CID', async () => {
      const form = new FormData()
      form.append('file', JSON.stringify({ Data: 'TEST' + Date.now(), Links: [] }), { filename: 'node.json' })
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/put?cid-base=base64',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
    })

    it('should not put data for invalid cid-base option', async () => {
      const form = new FormData()
      form.append('file', JSON.stringify({ Data: 'TEST' + Date.now(), Links: [] }), { filename: 'node.json' })
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: '/api/v0/object/put?cid-base=invalid',
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })
  })

  describe('/stat', () => {
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
      ipfs.object.stat.withArgs(cid).returns({
        Hash: cid.toString(),
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

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should stat object and return a base64 encoded CID', async () => {
      let res = await http({
        method: 'POST',
        url: '/api/v0/object/new'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)

      res = await http({
        method: 'POST',
        url: '/api/v0/object/stat?cid-base=base64&arg=' + res.result.Hash
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
    })

    it('should not stat object for invalid cid-base option', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/stat?cid-base=invalid&arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })
  })

  describe('/data', () => {
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
      ipfs.object.data.withArgs(cid).returns(emptyDirectoryNode.Data)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/data?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.property('result', emptyDirectoryNode.Data.toString())
    })
  })

  describe('/links', () => {
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
      ipfs.object.links.withArgs(cid).returns(fileNode.Links)

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
        url: `/api/v0/object/links?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.property('result', expectedResult)
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should list object links and return a base64 encoded CID', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/links?cid-base=base64&arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
      expect(res).to.have.nested.property('result.Links').that.is.empty()
      expect(multibase.isEncoded(res.result.Links[0].Hash)).to.deep.equal('base64')
    })

    it('should not list object links for invalid cid-base option', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/links?cid-base=invalid&arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })
  })

  describe('/patch/append-data', () => {
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
      const data = Buffer.from('TEST' + Date.now())

      ipfs.object.patch.appendData.withArgs(cid, data).returns(cid)
      ipfs.object.get.withArgs(cid).returns(emptyDirectoryNode)

      const form = new FormData()
      form.append('data', data)
      const headers = form.getHeaders()
      const expectedResult = {
        Data: emptyDirectoryNode.Data,
        Hash: cid.toString(),
        Links: [],
        Size: 4
      }

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/append-data?arg=${cid}`,
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res.result).to.deep.equal(expectedResult)
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should append data to object and return a base64 encoded CID', async () => {
      const form = new FormData()
      form.append('data', Buffer.from('TEST' + Date.now()))
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/append-data?cid-base=base64&arg=${cid}`,
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
    })

    it('should not append data to object for invalid cid-base option', async () => {
      const form = new FormData()
      form.append('data', Buffer.from('TEST' + Date.now()))
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/append-data?cid-base=invalid&arg=${cid}`,
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })
  })

  describe('/patch/set-data', () => {
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
      const data = Buffer.from('TEST' + Date.now())

      ipfs.object.patch.setData.withArgs(cid, data).returns(cid)
      ipfs.object.get.withArgs(cid).returns(emptyDirectoryNode)

      const form = new FormData()
      form.append('data', data)
      const headers = form.getHeaders()
      const expectedResult = {
        Hash: cid.toString(),
        Links: []
      }

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/set-data?arg=${cid}`,
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res.result).to.deep.equal(expectedResult)
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should set data for object and return a base64 encoded CID', async () => {
      const form = new FormData()
      form.append('data', Buffer.from('TEST' + Date.now()))
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/set-data?cid-base=base64&arg=${cid}`,
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
    })

    it('should not set data for object for invalid cid-base option', async () => {
      const form = new FormData()
      form.append('data', Buffer.from('TEST' + Date.now()))
      const headers = form.getHeaders()

      const payload = await streamToPromise(form)
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/set-data?cid-base=invalid&arg=${cid}`,
        headers,
        payload
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })
  })

  describe('/patch/add-link', () => {
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
      const name = 'name'

      ipfs.object.patch.addLink.withArgs(cid, sinon.match({
        Name: name,
        Hash: cid2
      })).returns(cid)
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

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should add a link to an object and return a base64 encoded CID', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/add-link?cid-base=base64&arg=${cid}&arg=test&arg=${cid2}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
    })

    it('should not add a link to an object for invalid cid-base option', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/add-link?cid-base=invalid&arg=${cid}&arg=test&arg=${cid2}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })
  })

  describe('/patch/rm-link', () => {
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
      const name = 'name'

      ipfs.object.patch.rmLink.withArgs(cid, sinon.match({
        name
      })).returns(cid2)
      ipfs.object.get.withArgs(cid2).returns(emptyDirectoryNode)

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/rm-link?arg=${cid}&arg=${name}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Hash', cid2.toString())
    })

    // TODO: unskip after switch to v1 CIDs by default
    it.skip('should remove a link from an object and return a base64 encoded CID', async () => {
      const name = 'name'

      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/rm-link?cid-base=base64&arg=${cid}&arg=${name}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
    })

    it('should not remove a link from an object for invalid cid-base option', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/object/patch/rm-link?cid-base=invalid&arg=${cid}&arg=derp`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })
  })
})
