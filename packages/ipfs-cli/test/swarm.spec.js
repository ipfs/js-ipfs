/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { cli, fail } from './utils/cli.js'
import sinon from 'sinon'
import { Multiaddr } from 'multiaddr'

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
      const multiaddr = new Multiaddr('/ip4/123.123.123.123/tcp/482')

      ipfs.swarm.connect.withArgs(multiaddr, defaultOptions).resolves()

      const out = await cli(`swarm connect ${multiaddr}`, { ipfs, isDaemon: true })
      expect(out).to.equal(`${multiaddr}\n`)
    })

    it('connect offline', async () => {
      const multiaddr = new Multiaddr('/ip4/123.123.123.123/tcp/482')

      const out = await fail(`swarm connect ${multiaddr}`, { ipfs, isDaemon: false })
      expect(out).to.include('This command must be run in online mode')

      expect(ipfs.swarm.connect.called).to.be.false()
    })

    it('connect with timeout', async () => {
      const multiaddr = new Multiaddr('/ip4/123.123.123.123/tcp/482')

      ipfs.swarm.connect.withArgs(multiaddr, {
        ...defaultOptions,
        timeout: 1000
      }).resolves()

      const out = await cli(`swarm connect ${multiaddr} --timeout=1s`, { ipfs, isDaemon: true })
      expect(out).to.equal(`${multiaddr}\n`)
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
      const out = await fail('swarm peers', { ipfs, isDaemon: false })
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
          new Multiaddr(addr)
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
          new Multiaddr(addr)
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
        const out = await fail('swarm addrs local', { ipfs, isDaemon: false })
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
      const multiaddr = new Multiaddr('/ip4/123.123.123.123/tcp/482')
      ipfs.swarm.disconnect.withArgs(multiaddr, defaultOptions).resolves()
      const out = await cli(`swarm disconnect ${multiaddr}`, { ipfs, isDaemon: true })
      expect(out).to.equal(`${multiaddr}\n`)
    })

    it('disconnect offline', async () => {
      const multiaddr = new Multiaddr('/ip4/123.123.123.123/tcp/482')
      const out = await fail(`swarm disconnect ${multiaddr}`, { ipfs, isDaemon: false })
      expect(out).to.include('This command must be run in online mode')
    })

    it('disconnect with timeout', async () => {
      const multiaddr = new Multiaddr('/ip4/123.123.123.123/tcp/482')
      ipfs.swarm.disconnect.withArgs(multiaddr, {
        ...defaultOptions,
        timeout: 1000
      }).resolves()
      const out = await cli(`swarm disconnect ${multiaddr} --timeout=1s`, { ipfs, isDaemon: true })
      expect(out).to.equal(`${multiaddr}\n`)
    })
  })
})
