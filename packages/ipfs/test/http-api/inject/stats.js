/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const allNdjson = require('../../utils/all-ndjson')
const { AbortSignal } = require('abort-controller')

describe('/stats', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      stats: {
        bw: sinon.stub()
      }
    }
  })

  describe('/bw', () => {
    const defaultOptions = {
      peer: undefined,
      proto: undefined,
      poll: false,
      interval: '1s',
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/stats/bw')
    })

    it('should return bandwith stats', async () => {
      ipfs.stats.bw.withArgs(defaultOptions).returns([{
        totalIn: 'totalIn1',
        totalOut: 'totalOut1',
        rateIn: 'rateIn1',
        rateOut: 'rateOut1'
      }, {
        totalIn: 'totalIn2',
        totalOut: 'totalOut2',
        rateIn: 'rateIn2',
        rateOut: 'rateOut2'
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/stats/bw'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(allNdjson(res)).to.deep.equal([{
        TotalIn: 'totalIn1',
        TotalOut: 'totalOut1',
        RateIn: 'rateIn1',
        RateOut: 'rateOut1'
      }, {
        TotalIn: 'totalIn2',
        TotalOut: 'totalOut2',
        RateIn: 'rateIn2',
        RateOut: 'rateOut2'
      }])
    })

    it('should return bandwith stats for a peer', async () => {
      const peer = 'QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr'

      ipfs.stats.bw.withArgs({
        ...defaultOptions,
        peer
      }).returns([{
        totalIn: 'totalIn1',
        totalOut: 'totalOut1',
        rateIn: 'rateIn1',
        rateOut: 'rateOut1'
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/stats/bw?peer=${peer}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(allNdjson(res)).to.deep.equal([{
        TotalIn: 'totalIn1',
        TotalOut: 'totalOut1',
        RateIn: 'rateIn1',
        RateOut: 'rateOut1'
      }])
    })

    it('should return bandwith stats for a protocol', async () => {
      const proto = 'proto/v1.1'

      ipfs.stats.bw.withArgs({
        ...defaultOptions,
        proto
      }).returns([{
        totalIn: 'totalIn1',
        totalOut: 'totalOut1',
        rateIn: 'rateIn1',
        rateOut: 'rateOut1'
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/stats/bw?proto=${proto}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(allNdjson(res)).to.deep.equal([{
        TotalIn: 'totalIn1',
        TotalOut: 'totalOut1',
        RateIn: 'rateIn1',
        RateOut: 'rateOut1'
      }])
    })

    it('should poll for bandwith stats', async () => {
      const poll = true

      ipfs.stats.bw.withArgs({
        ...defaultOptions,
        poll
      }).returns([{
        totalIn: 'totalIn1',
        totalOut: 'totalOut1',
        rateIn: 'rateIn1',
        rateOut: 'rateOut1'
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/stats/bw?poll=${poll}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(allNdjson(res)).to.deep.equal([{
        TotalIn: 'totalIn1',
        TotalOut: 'totalOut1',
        RateIn: 'rateIn1',
        RateOut: 'rateOut1'
      }])
    })

    it('should set an interval for bandwidth stats', async () => {
      const interval = '5s'

      ipfs.stats.bw.withArgs({
        ...defaultOptions,
        interval
      }).returns([{
        totalIn: 'totalIn1',
        totalOut: 'totalOut1',
        rateIn: 'rateIn1',
        rateOut: 'rateOut1'
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/stats/bw?interval=${interval}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(allNdjson(res)).to.deep.equal([{
        TotalIn: 'totalIn1',
        TotalOut: 'totalOut1',
        RateIn: 'rateIn1',
        RateOut: 'rateOut1'
      }])
    })

    it('should accept a timeout', async () => {
      ipfs.stats.bw.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        totalIn: 'totalIn1',
        totalOut: 'totalOut1',
        rateIn: 'rateIn1',
        rateOut: 'rateOut1'
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/stats/bw?timeout=1s'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(allNdjson(res)).to.deep.equal([{
        TotalIn: 'totalIn1',
        TotalOut: 'totalOut1',
        RateIn: 'rateIn1',
        RateOut: 'rateOut1'
      }])
    })
  })
})
