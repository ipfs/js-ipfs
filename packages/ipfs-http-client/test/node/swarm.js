/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import nock from 'nock'
import { create as httpClient } from '../../src/index.js'

describe('.swarm.peers', function () {
  this.timeout(50 * 1000) // slow CI

  const ipfs = httpClient('/ip4/127.0.0.1/tcp/5001')
  const apiUrl = 'http://127.0.0.1:5001'

  it('handles a peer response', async () => {
    const response = { Peers: [{ Addr: '/ip4/104.131.131.82/tcp/4001', Peer: 'QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ', Latency: '', Muxer: '', Streams: null }] }

    const scope = nock(apiUrl)
      .post('/api/v0/swarm/peers')
      .query(true)
      .reply(200, response)

    const res = await ipfs.swarm.peers()

    expect(res).to.be.a('array')
    expect(res.length).to.equal(1)
    expect(res[0].error).to.not.exist()
    expect(res[0].addr.toString()).to.equal(response.Peers[0].Addr)
    expect(res[0].peer.toString()).to.equal(response.Peers[0].Peer)
    expect(scope.isDone()).to.equal(true)
  })

  it('handles an ip6 quic peer', async () => {
    const response = { Peers: [{ Addr: '/ip6/2001:8a0:7ac5:4201:3ac9:86ff:fe31:7095/udp/4001/quic', Peer: 'QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSupNKC', Latency: '', Muxer: '', Streams: null }] }

    const scope = nock(apiUrl)
      .post('/api/v0/swarm/peers')
      .query(true)
      .reply(200, response)

    const res = await ipfs.swarm.peers()

    expect(res).to.be.a('array')
    expect(res.length).to.equal(1)
    expect(res[0].error).to.not.exist()
    expect(res[0].addr.toString()).to.equal(response.Peers[0].Addr)
    expect(res[0].peer.toString()).to.equal(response.Peers[0].Peer)
    expect(scope.isDone()).to.equal(true)
  })

  it('handles an error response', async () => {
    const scope = nock(apiUrl)
      .post('/api/v0/swarm/peers')
      .query(true)
      .replyWithError('something awful happened')

    await expect(ipfs.swarm.peers()).to.eventually.be.rejectedWith('something awful happened')

    expect(scope.isDone()).to.equal(true)
  })
})
