/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const nock = require('nock')
const ipfsClient = require('../../src')

describe('.swarm.peers', function () {
  this.timeout(50 * 1000) // slow CI

  const ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')
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
    expect(res[0].peer.toB58String()).to.equal(response.Peers[0].Peer)
    expect(scope.isDone()).to.equal(true)
  })

  it('handles a go-ipfs <= 0.4.4 peer response', async () => {
    const response = { Strings: ['/ip4/73.109.217.59/tcp/49311/ipfs/QmWjxEGC7BthJrCf7QTModrcsRweHbupdPTY4oGMVoDZXm'] }

    const scope = nock(apiUrl)
      .post('/api/v0/swarm/peers')
      .query(true)
      .reply(200, response)

    const res = await ipfs.swarm.peers()

    expect(res).to.be.a('array')
    expect(res.length).to.equal(1)
    expect(res[0].error).to.not.exist()
    expect(res[0].addr.toString()).to.equal('/ip4/73.109.217.59/tcp/49311/ipfs/QmWjxEGC7BthJrCf7QTModrcsRweHbupdPTY4oGMVoDZXm')
    expect(res[0].peer.toB58String()).to.equal('QmWjxEGC7BthJrCf7QTModrcsRweHbupdPTY4oGMVoDZXm')
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
    expect(res[0].peer.toB58String()).to.equal(response.Peers[0].Peer)
    expect(scope.isDone()).to.equal(true)
  })

  it('handles unvalidatable peer addr', async () => {
    const response = { Peers: [{ Addr: '/ip4/104.131.131.82/future-tech', Peer: 'QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSupNKC', Latency: '', Muxer: '', Streams: null }] }

    const scope = nock(apiUrl)
      .post('/api/v0/swarm/peers')
      .query(true)
      .reply(200, response)

    const res = await ipfs.swarm.peers()

    expect(res).to.be.a('array')
    expect(res.length).to.equal(1)
    expect(res[0].error).to.exist()
    expect(res[0].rawPeerInfo).to.deep.equal(response.Peers[0])
    expect(scope.isDone()).to.equal(true)
  })

  it('handles an error response', async () => {
    const scope = nock(apiUrl)
      .post('/api/v0/swarm/peers')
      .query(true)
      .replyWithError('something awful happened')

    await expect(ipfs.swarm.peers()).to.be.rejectedWith('something awful happened')

    expect(scope.isDone()).to.equal(true)
  })
})
