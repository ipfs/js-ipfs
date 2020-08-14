/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const qs = require('qs')
const defaultList = require('../../../src/core/runtime/config-nodejs.js')().Bootstrap
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const { AbortSignal } = require('abort-controller')

describe('/bootstrap', () => {
  const validIp4 = '/ip4/101.236.176.52/tcp/4001/p2p/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z'
  let ipfs

  beforeEach(() => {
    ipfs = {
      bootstrap: {
        list: sinon.stub(),
        add: sinon.stub(),
        rm: sinon.stub(),
        clear: sinon.stub(),
        reset: sinon.stub()
      }
    }
  })

  describe('/list', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/bootstrap/list')
    })

    it('returns a list', async () => {
      ipfs.bootstrap.list.withArgs(defaultOptions).returns({
        Peers: defaultList
      })

      const res = await http({
        method: 'POST',
        url: '/api/v0/bootstrap/list'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Peers', defaultList)
    })

    it('alias', async () => {
      ipfs.bootstrap.list.withArgs(defaultOptions).returns({
        Peers: defaultList
      })

      const res = await http({
        method: 'POST',
        url: '/api/v0/bootstrap'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Peers', defaultList)
    })

    it('accepts a timeout', async () => {
      ipfs.bootstrap.list.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns({
        Peers: defaultList
      })

      const res = await http({
        method: 'POST',
        url: '/api/v0/bootstrap/list?timeout=1s'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Peers', defaultList)
    })
  })

  describe('/add', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      const query = {
        arg: validIp4
      }

      return testHttpMethod(`/api/v0/bootstrap/add?${qs.stringify(query)}`)
    })

    it('adds a bootstrapper', async () => {
      ipfs.bootstrap.add.withArgs(validIp4, defaultOptions).returns({
        Peers: [
          validIp4
        ]
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/bootstrap/add?arg=${validIp4}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Peers', [validIp4])
    })

    it('adds a bootstrapper with a timeout', async () => {
      ipfs.bootstrap.add.withArgs(validIp4, {
        ...defaultOptions,
        timeout: 1000
      }).returns({
        Peers: [
          validIp4
        ]
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/bootstrap/add?arg=${validIp4}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Peers', [validIp4])
    })

    it('restores default', async () => {
      ipfs.bootstrap.reset.withArgs(defaultOptions).returns({
        Peers: defaultList
      })

      const res = await http({
        method: 'POST',
        url: '/api/v0/bootstrap/add?default=true'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Peers', defaultList)
    })

    it('accepts a timeout', async () => {
      ipfs.bootstrap.reset.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns({
        Peers: defaultList
      })

      const res = await http({
        method: 'POST',
        url: '/api/v0/bootstrap/add?default=true&timeout=1s'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Peers', defaultList)
    })

    describe('/default', () => {
      const defaultOptions = {
        signal: sinon.match.instanceOf(AbortSignal),
        timeout: undefined
      }

      it('only accepts POST', () => {
        return testHttpMethod('/api/v0/bootstrap/add/default')
      })

      it('restores default', async () => {
        ipfs.bootstrap.reset.withArgs(defaultOptions).returns({
          Peers: defaultList
        })

        const res = await http({
          method: 'POST',
          url: '/api/v0/bootstrap/add/default'
        }, { ipfs })

        expect(res).to.have.property('statusCode', 200)
        expect(res).to.have.deep.nested.property('result.Peers', defaultList)
      })

      it('accepts a timeout', async () => {
        ipfs.bootstrap.reset.withArgs({
          ...defaultOptions,
          timeout: 1000
        }).returns({
          Peers: defaultList
        })

        const res = await http({
          method: 'POST',
          url: '/api/v0/bootstrap/add/default?timeout=1s'
        }, { ipfs })

        expect(res).to.have.property('statusCode', 200)
        expect(res).to.have.deep.nested.property('result.Peers', defaultList)
      })
    })
  })

  describe('/rm', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      const query = {
        arg: validIp4
      }

      return testHttpMethod(`/api/v0/bootstrap/rm?${qs.stringify(query)}`)
    })

    it('removes a bootstrapper', async () => {
      ipfs.bootstrap.rm.withArgs(validIp4, defaultOptions).returns({
        Peers: [
          validIp4
        ]
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/bootstrap/rm?arg=${validIp4}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Peers', [validIp4])
    })

    it('removes a bootstrapper with a timeout', async () => {
      ipfs.bootstrap.rm.withArgs(validIp4, {
        ...defaultOptions,
        timeout: 1000
      }).returns({
        Peers: [
          validIp4
        ]
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/bootstrap/rm?arg=${validIp4}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Peers', [validIp4])
    })

    it('removes all bootstrappers', async () => {
      ipfs.bootstrap.clear.withArgs(defaultOptions).returns({
        Peers: defaultList
      })

      const res = await http({
        method: 'POST',
        url: '/api/v0/bootstrap/rm?all=true'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Peers', defaultList)
    })

    it('accepts a timeout', async () => {
      ipfs.bootstrap.clear.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns({
        Peers: defaultList
      })

      const res = await http({
        method: 'POST',
        url: '/api/v0/bootstrap/rm?all=true&timeout=1s'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Peers', defaultList)
    })

    describe('/all', () => {
      const defaultOptions = {
        signal: sinon.match.instanceOf(AbortSignal),
        timeout: undefined
      }

      it('only accepts POST', () => {
        return testHttpMethod('/api/v0/bootstrap/rm/all')
      })

      it('removes all bootstrappers', async () => {
        ipfs.bootstrap.clear.withArgs(defaultOptions).returns({
          Peers: defaultList
        })

        const res = await http({
          method: 'POST',
          url: '/api/v0/bootstrap/rm/all'
        }, { ipfs })

        expect(res).to.have.property('statusCode', 200)
        expect(res).to.have.deep.nested.property('result.Peers', defaultList)
      })

      it('accepts a timeout', async () => {
        ipfs.bootstrap.clear.withArgs({
          ...defaultOptions,
          timeout: 1000
        }).returns({
          Peers: defaultList
        })

        const res = await http({
          method: 'POST',
          url: '/api/v0/bootstrap/rm/all?timeout=1s'
        }, { ipfs })

        expect(res).to.have.property('statusCode', 200)
        expect(res).to.have.deep.nested.property('result.Peers', defaultList)
      })
    })
  })
})
