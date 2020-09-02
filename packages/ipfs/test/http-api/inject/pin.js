/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { expect } = require('aegir/utils/chai')
const multibase = require('multibase')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const CID = require('cids')
const allNdjson = require('../../utils/all-ndjson')
const { AbortSignal } = require('abort-controller')

describe('/pin', () => {
  const cid = new CID('QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr')
  const cid2 = new CID('QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V')
  let ipfs

  beforeEach(() => {
    ipfs = {
      pin: {
        ls: sinon.stub(),
        addAll: sinon.stub(),
        rmAll: sinon.stub(),
        query: sinon.stub()
      }
    }
  })

  describe('/rm', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod(`/api/v0/pin/rm?arg=${cid}`)
    })

    it('fails on invalid args', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/pin/rm?arg=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('unpins recursive pins', async () => {
      ipfs.pin.rmAll.withArgs([{ cid, recursive: true }], defaultOptions).returns([
        cid
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/pin/rm?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Pins', [cid.toString()])
    })

    it('unpins direct pins', async () => {
      ipfs.pin.rmAll.withArgs([{
        cid,
        recursive: false
      }], {
        ...defaultOptions
      }).returns([
        cid
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/pin/rm?arg=${cid}&recursive=false`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Pins', [cid.toString()])
    })

    it('should remove pin and return base64 encoded CID', async () => {
      ipfs.pin.rmAll.withArgs([{ cid, recursive: true }], defaultOptions).returns([
        cid
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/pin/rm?arg=${cid}&cid-base=base64`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      res.result.Pins.forEach(cid => {
        expect(multibase.isEncoded(cid)).to.deep.equal('base64')
      })
    })

    it('should not remove pin for invalid cid-base option', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/pin/rm?arg=${cid}&cid-base=invalid`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })

    it('accepts a timeout', async () => {
      ipfs.pin.rmAll.withArgs([{
        cid,
        recursive: true
      }], {
        ...defaultOptions,
        timeout: 1000
      }).returns([
        cid
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/pin/rm?arg=${cid}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Pins', [cid.toString()])
    })
  })

  describe('/add', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod(`/api/v0/pin/add?arg=${cid}`)
    })

    it('fails on invalid args', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/pin/add?arg=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('recursively', async () => {
      ipfs.pin.addAll.withArgs([{
        cid,
        recursive: true,
        metadata: undefined
      }], defaultOptions).returns([
        cid
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/pin/add?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Pins', [cid.toString()])
    })

    it('directly', async () => {
      ipfs.pin.addAll.withArgs([{
        cid,
        recursive: false,
        metadata: undefined
      }], defaultOptions).returns([
        cid
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/pin/add?arg=${cid}&recursive=false`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Pins', [cid.toString()])
    })

    it('should add pin and return base64 encoded CID', async () => {
      ipfs.pin.addAll.withArgs([{
        cid,
        recursive: true,
        metadata: undefined
      }], defaultOptions).returns([
        cid
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/pin/add?arg=${cid}&cid-base=base64`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      res.result.Pins.forEach(cid => {
        expect(multibase.isEncoded(cid)).to.deep.equal('base64')
      })
    })

    it('should not add pin for invalid cid-base option', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/pin/add?arg=${cid}&cid-base=invalid`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })

    it('accepts a timeout', async () => {
      ipfs.pin.addAll.withArgs([{
        cid,
        recursive: true,
        metadata: undefined
      }], {
        ...defaultOptions,
        timeout: 1000
      }).returns([
        cid
      ])

      const res = await http({
        method: 'POST',
        url: `/api/v0/pin/add?arg=${cid}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Pins', [cid.toString()])
    })
  })

  describe('/ls', () => {
    const defaultOptions = {
      type: 'all',
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined,
      paths: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/pin/ls')
    })

    it('fails on invalid args', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/pin/ls?arg=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('finds all pinned objects', async () => {
      ipfs.pin.ls.withArgs(defaultOptions).returns([{
        cid,
        type: 'recursive'
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/pin/ls'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Keys').that.includes.keys(cid.toString())
    })

    it('finds all pinned objects streaming', async () => {
      ipfs.pin.ls.withArgs(defaultOptions).returns([{
        cid: cid,
        type: 'recursive'
      }, {
        cid: cid2,
        type: 'recursive'
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/pin/ls?stream=true'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(allNdjson(res)).to.deep.equal([
        { Cid: cid.toString(), Type: 'recursive' },
        { Cid: cid2.toString(), Type: 'recursive' }
      ])
    })

    it('finds specific pinned objects', async () => {
      ipfs.pin.ls.withArgs({
        ...defaultOptions,
        paths: [`${cid}`]
      }).returns([{
        cid,
        type: 'recursive'
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/pin/ls?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Keys').that.deep.includes({
        [cid.toString()]: {
          Type: 'recursive'
        }
      })
    })

    it('finds pins of type', async () => {
      ipfs.pin.ls.withArgs({
        ...defaultOptions,
        type: 'direct'
      }).returns([{
        cid,
        type: 'direct'
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/pin/ls?type=direct'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Keys').that.deep.includes({
        [cid.toString()]: {
          Type: 'direct'
        }
      })
    })

    it('should list pins and return base64 encoded CIDs', async () => {
      ipfs.pin.ls.withArgs(defaultOptions).returns([{
        cid,
        type: 'direct'
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/pin/ls?cid-base=base64'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Keys').that.satisfies((keys) => {
        return Object.keys(keys).reduce((acc, curr) => {
          return acc && multibase.isEncoded(curr) === 'base64'
        }, true)
      })
    })

    it('should not list pins for invalid cid-base option', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/pin/ls?cid-base=invalid'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes('Invalid request query input')
    })

    it('accepts a timeout', async () => {
      ipfs.pin.ls.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        cid,
        type: 'recursive'
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/pin/ls?timeout=1s'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Keys').that.includes.keys(cid.toString())
    })
  })
})
