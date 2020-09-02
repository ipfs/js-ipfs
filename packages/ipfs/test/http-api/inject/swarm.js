/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const { AbortSignal } = require('abort-controller')

describe('/swarm', () => {
  const multiaddr = '/ip4/127.0.0.1/tcp/4002/p2p/QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr'
  let ipfs

  beforeEach(() => {
    ipfs = {
      swarm: {
        peers: sinon.stub(),
        addrs: sinon.stub(),
        localAddrs: sinon.stub(),
        connect: sinon.stub(),
        disconnect: sinon.stub()
      }
    }
  })

  describe('/peers', () => {
    const defaultOptions = {
      verbose: false,
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/swarm/peers')
    })

    it('should return peers', async () => {
      ipfs.swarm.peers.withArgs(defaultOptions).returns([{
        peer: 'peerId',
        addr: 'addr',
        direction: 'direction',
        muxer: 'muxer',
        latency: 'latency'
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/swarm/peers'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Peers').with.lengthOf(1).that.deep.includes({
        Peer: 'peerId',
        Addr: 'addr'
      })
    })

    it('should return verbose peers', async () => {
      ipfs.swarm.peers.withArgs({
        ...defaultOptions,
        verbose: true
      }).returns([{
        peer: 'peerId',
        addr: 'addr',
        direction: 'direction',
        muxer: 'muxer',
        latency: 'latency'
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/swarm/peers?verbose=true'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Peers').with.lengthOf(1).that.deep.includes({
        Peer: 'peerId',
        Addr: 'addr',
        Direction: 'direction',
        Muxer: 'muxer',
        Latency: 'latency'
      })
    })

    it('should return verbose peers (short option)', async () => {
      ipfs.swarm.peers.withArgs({
        ...defaultOptions,
        verbose: true
      }).returns([{
        peer: 'peerId',
        addr: 'addr',
        direction: 'direction',
        muxer: 'muxer',
        latency: 'latency'
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/swarm/peers?v=true'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Peers').with.lengthOf(1).that.deep.includes({
        Peer: 'peerId',
        Addr: 'addr',
        Direction: 'direction',
        Muxer: 'muxer',
        Latency: 'latency'
      })
    })

    it('should return peers with direction', async () => {
      ipfs.swarm.peers.withArgs(defaultOptions).returns([{
        peer: 'peerId',
        addr: 'addr',
        direction: 'direction',
        muxer: 'muxer',
        latency: 'latency'
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/swarm/peers?direction=true'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Peers').with.lengthOf(1).that.deep.includes({
        Peer: 'peerId',
        Addr: 'addr',
        Direction: 'direction'
      })
    })

    it('accepts a timeout', async () => {
      ipfs.swarm.peers.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        peer: 'peerId',
        addr: 'addr',
        direction: 'direction',
        muxer: 'muxer',
        latency: 'latency'
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/swarm/peers?timeout=1s'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Peers').with.lengthOf(1).that.deep.includes({
        Peer: 'peerId',
        Addr: 'addr'
      })
    })
  })

  describe('/addrs', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/swarm/addrs')
    })

    it('should return addresses', async () => {
      ipfs.swarm.addrs.withArgs(defaultOptions).returns([{
        id: 'peerId',
        addrs: [
          'addr'
        ]
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/swarm/addrs'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Addrs').that.deep.equal({
        peerId: [
          'addr'
        ]
      })
    })

    it('accepts a timeout', async () => {
      ipfs.swarm.addrs.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        id: 'peerId',
        addrs: [
          'addr'
        ]
      }])

      const res = await http({
        method: 'POST',
        url: '/api/v0/swarm/addrs?timeout=1s'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Addrs').that.deep.equal({
        peerId: [
          'addr'
        ]
      })
    })

    describe('/local', () => {
      const defaultOptions = {
        signal: sinon.match.instanceOf(AbortSignal),
        timeout: undefined
      }

      it('only accepts POST', () => {
        return testHttpMethod('/api/v0/swarm/addrs/local')
      })

      it('should return local addresses', async () => {
        ipfs.swarm.localAddrs.withArgs(defaultOptions).returns([
          'addr'
        ])

        const res = await http({
          method: 'POST',
          url: '/api/v0/swarm/addrs/local'
        }, { ipfs })

        expect(res).to.have.property('statusCode', 200)
        expect(res).to.have.nested.property('result.Strings').with.lengthOf(1).that.includes('addr')
      })

      it('accepts a timeout', async () => {
        ipfs.swarm.localAddrs.withArgs({
          ...defaultOptions,
          timeout: 1000
        }).returns([
          'addr'
        ])

        const res = await http({
          method: 'POST',
          url: '/api/v0/swarm/addrs/local?timeout=1s'
        }, { ipfs })

        expect(res).to.have.property('statusCode', 200)
        expect(res).to.have.nested.property('result.Strings').with.lengthOf(1).that.includes('addr')
      })
    })
  })

  describe('/connect', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/swarm/connect')
    })

    it('should connect', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/swarm/connect?arg=${multiaddr}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Strings').with.lengthOf(1).that.includes(`connect ${multiaddr} success`)
      expect(ipfs.swarm.connect.calledWith(multiaddr, defaultOptions)).to.be.true()
    })

    it('should accept timeout', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/swarm/connect?arg=${multiaddr}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Strings').with.lengthOf(1).that.includes(`connect ${multiaddr} success`)
      expect(ipfs.swarm.connect.calledWith(multiaddr, {
        ...defaultOptions,
        timeout: 1000
      })).to.be.true()
    })
  })

  describe('/disconnect', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/swarm/disconnect')
    })

    it('should disconnect', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/swarm/disconnect?arg=${multiaddr}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Strings').with.lengthOf(1).that.includes(`disconnect ${multiaddr} success`)
      expect(ipfs.swarm.disconnect.calledWith(multiaddr, defaultOptions)).to.be.true()
    })

    it('should accept timeout', async () => {
      const res = await http({
        method: 'POST',
        url: `/api/v0/swarm/disconnect?arg=${multiaddr}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Strings').with.lengthOf(1).that.includes(`disconnect ${multiaddr} success`)
      expect(ipfs.swarm.disconnect.calledWith(multiaddr, {
        ...defaultOptions,
        timeout: 1000
      })).to.be.true()
    })
  })
})
