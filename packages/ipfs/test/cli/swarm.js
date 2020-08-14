/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const cli = require('../utils/cli')
const sinon = require('sinon')
const ma = require('multiaddr')

describe('swarm', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      swarm: {
        connect: sinon.stub(),
        peers: sinon.stub(),
        addrs: sinon.stub(),
        localAddrs: sinon.stub(),
        disconnect: sinon.stub()
      }
    }
  })

  describe('connect', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('connect online', async () => {
      const multiaddr = 'multiaddr'
      const result = 'result'

      ipfs.swarm.connect.withArgs(multiaddr, defaultOptions).resolves([result])

      const out = await cli(`swarm connect ${multiaddr}`, { ipfs, isDaemon: true })
      expect(out).to.equal(`${result}\n`)
    })

    it('connect offline', async () => {
      const multiaddr = 'multiaddr'

      const out = await cli.fail(`swarm connect ${multiaddr}`, { ipfs, isDaemon: false })
      expect(out).to.include('This command must be run in online mode')

      expect(ipfs.swarm.connect.called).to.be.false()
    })

    it('connect with timeout', async () => {
      const multiaddr = 'multiaddr'
      const result = 'result'

      ipfs.swarm.connect.withArgs(multiaddr, {
        ...defaultOptions,
        timeout: 1000
      }).resolves([result])

      const out = await cli(`swarm connect ${multiaddr} --timeout=1s`, { ipfs, isDaemon: true })
      expect(out).to.equal(`${result}\n`)
    })
  })

  describe('peers', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('peers online', async () => {
      ipfs.swarm.peers.withArgs(defaultOptions).resolves([{
        peer: 'Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z',
        addr: '/ip4/192.0.0.1/tcp/5001'
      }, {
        addr: '/ip4/192.0.0.2/tcp/5002/p2p/Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5a'
      }])

      const out = await cli('swarm peers', { ipfs, isDaemon: true })
      expect(out).to.equal('/ip4/192.0.0.1/tcp/5001/p2p/Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z\n/ip4/192.0.0.2/tcp/5002/p2p/Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5a\n')
    })

    it('peers offline', async () => {
      const out = await cli.fail('swarm peers', { ipfs, isDaemon: false })
      expect(out).to.include('This command must be run in online mode')

      expect(ipfs.swarm.peers.called).to.be.false()
    })

    it('peers with timeout', async () => {
      ipfs.swarm.peers.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).resolves([{
        peer: 'Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z',
        addr: '/ip4/192.0.0.1/tcp/5001'
      }, {
        addr: '/ip4/192.0.0.2/tcp/5002/p2p/Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5a'
      }])

      const out = await cli('swarm peers --timeout=1s', { ipfs, isDaemon: true })
      expect(out).to.equal('/ip4/192.0.0.1/tcp/5001/p2p/Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z\n/ip4/192.0.0.2/tcp/5002/p2p/Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5a\n')
    })
  })

  describe('addrs', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('addrs', async () => {
      const peer = 'Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z'
      const addr = `/ip4/192.0.0.2/tcp/5002/p2p/${peer}`

      ipfs.swarm.addrs.withArgs(defaultOptions).resolves([{
        id: peer,
        addrs: [
          ma(addr)
        ]
      }])

      const out = await cli('swarm addrs', { ipfs })
      expect(out).to.equal(`${peer} (1)\n\t${addr}\n`)
    })

    it('addrs with timeout', async () => {
      const peer = 'Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z'
      const addr = `/ip4/192.0.0.2/tcp/5002/p2p/${peer}`

      ipfs.swarm.addrs.withArgs({
        ...defaultOptions,
        timeout: 1000
      }).resolves([{
        id: peer,
        addrs: [
          ma(addr)
        ]
      }])

      const out = await cli('swarm addrs --timeout=1s', { ipfs })
      expect(out).to.equal(`${peer} (1)\n\t${addr}\n`)
    })

    describe('local', () => {
      it('addrs local', async () => {
        const addr = 'addr'

        ipfs.swarm.localAddrs.withArgs(defaultOptions).resolves([
          addr
        ])

        const out = await cli('swarm addrs local', { ipfs, isDaemon: true })
        expect(out).to.equal(`${addr}\n`)
      })

      it('addrs local offline', async () => {
        const out = await cli.fail('swarm addrs local', { ipfs, isDaemon: false })
        expect(out).to.include('This command must be run in online mode')
      })

      it('addrs local with timeout', async () => {
        const addr = 'addr'

        ipfs.swarm.localAddrs.withArgs({
          ...defaultOptions,
          timeout: 1000
        }).resolves([
          addr
        ])

        const out = await cli('swarm addrs local --timeout=1s', { ipfs, isDaemon: true })
        expect(out).to.equal(`${addr}\n`)
      })
    })
  })

  describe('disconnect', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('disconnect online', async () => {
      const addr = 'addr'
      ipfs.swarm.disconnect.withArgs(addr, defaultOptions).resolves([addr])
      const out = await cli(`swarm disconnect ${addr}`, { ipfs, isDaemon: true })
      expect(out).to.equal(`${addr}\n`)
    })

    it('disconnect offline', async () => {
      const addr = 'addr'
      const out = await cli.fail(`swarm disconnect ${addr}`, { ipfs, isDaemon: false })
      expect(out).to.include('This command must be run in online mode')
    })

    it('disconnect with timeout', async () => {
      const addr = 'addr'
      ipfs.swarm.disconnect.withArgs(addr, {
        ...defaultOptions,
        timeout: 1000
      }).resolves([addr])
      const out = await cli(`swarm disconnect ${addr} --timeout=1s`, { ipfs, isDaemon: true })
      expect(out).to.equal(`${addr}\n`)
    })
  })
})
