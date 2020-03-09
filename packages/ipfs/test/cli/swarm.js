/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
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

  it('connect online', async () => {
    const multiaddr = 'multiaddr'
    const result = 'result'

    ipfs.swarm.connect.withArgs(multiaddr).resolves([result])

    const out = await cli(`swarm connect ${multiaddr}`, { ipfs, isDaemon: true })
    expect(out).to.equal(`${result}\n`)
  })

  it('connect offline', async () => {
    const multiaddr = 'multiaddr'

    const out = await cli.fail(`swarm connect ${multiaddr}`, { ipfs, isDaemon: false })
    expect(out).to.include('This command must be run in online mode')

    expect(ipfs.swarm.connect.called).to.be.false()
  })

  it('peers online', async () => {
    ipfs.swarm.peers.resolves([{
      peer: { toB58String: () => 'Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z' },
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

  it('addrs', async () => {
    const peer = 'Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z'
    const addr = `/ip4/192.0.0.2/tcp/5002/p2p/${peer}`

    ipfs.swarm.addrs.resolves([{
      id: { toB58String: () => peer },
      multiaddrs: {
        size: 1,
        toArray: () => [
          ma(addr)
        ]
      }
    }])

    const out = await cli('swarm addrs', { ipfs })
    expect(out).to.equal(`${peer} (1)\n\t${addr}\n`)
  })

  it('addrs local', async () => {
    const addr = 'addr'

    ipfs.swarm.localAddrs.resolves([
      addr
    ])

    const out = await cli('swarm addrs local', { ipfs, isDaemon: true })
    expect(out).to.equal(`${addr}\n`)
  })

  it('addrs local offline', async () => {
    const out = await cli.fail('swarm addrs local', { ipfs, isDaemon: false })
    expect(out).to.include('This command must be run in online mode')
  })

  it('disconnect', async () => {
    const addr = 'addr'
    ipfs.swarm.disconnect.withArgs(addr).resolves([addr])
    const out = await cli(`swarm disconnect ${addr}`, { ipfs, isDaemon: true })
    expect(out).to.equal(`${addr}\n`)
  })

  it('disconnect offline', async () => {
    const addr = 'addr'
    const out = await cli.fail(`swarm disconnect ${addr}`, { ipfs, isDaemon: false })
    expect(out).to.include('This command must be run in online mode')
  })
})
