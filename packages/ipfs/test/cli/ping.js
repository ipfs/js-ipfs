/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const factory = require('../utils/factory')
const ipfsExec = require('../utils/ipfs-exec')

describe('ping', function () {
  this.timeout(60 * 1000)
  let ipfsdA
  let ipfsdB
  let bMultiaddr
  let ipfsdBId
  let cli
  const df = factory({ type: 'js' })

  before(async function () {
    this.timeout(60 * 1000)

    ipfsdB = await df.spawn()
    const peerInfo = await ipfsdB.api.id()
    ipfsdBId = peerInfo.id
    bMultiaddr = peerInfo.addresses[0]
  })

  before(async function () {
    this.timeout(60 * 1000)

    ipfsdA = await df.spawn()
    // Without DHT we need to have an already established connection
    await ipfsdA.api.swarm.connect(bMultiaddr)
  })

  before(() => {
    this.timeout(60 * 1000)
    cli = ipfsExec(ipfsdA.path)
  })

  after(() => df.clean())

  it('ping host', async () => {
    this.timeout(60 * 1000)
    const ping = cli(`ping ${ipfsdBId}`)
    const result = []
    ping.stdout.on('data', (output) => {
      const packets = output.toString().split('\n').slice(0, -1)
      result.push(...packets)
    })

    await ping

    expect(result).to.have.lengthOf(12)
    expect(result[0]).to.equal(`PING ${ipfsdBId}`)
    for (let i = 1; i < 11; i++) {
      expect(result[i]).to.match(/^Pong received: time=\d+ ms$/)
    }
    expect(result[11]).to.match(/^Average latency: \d+(.\d+)?ms$/)
  })

  it('ping host with --n option', async () => {
    this.timeout(60 * 1000)
    const ping = cli(`ping --n 1 ${ipfsdBId}`)
    const result = []
    ping.stdout.on('data', (output) => {
      const packets = output.toString().split('\n').slice(0, -1)
      result.push(...packets)
    })

    await ping

    expect(result).to.have.lengthOf(3)
    expect(result[0]).to.equal(`PING ${ipfsdBId}`)
    expect(result[1]).to.match(/^Pong received: time=\d+ ms$/)
    expect(result[2]).to.match(/^Average latency: \d+(.\d+)?ms$/)
  })

  it('ping host with --count option', async () => {
    this.timeout(60 * 1000)
    const ping = cli(`ping --count 1 ${ipfsdBId}`)
    const result = []
    ping.stdout.on('data', (output) => {
      const packets = output.toString().split('\n').slice(0, -1)
      result.push(...packets)
    })

    await ping

    expect(result).to.have.lengthOf(3)
    expect(result[0]).to.equal(`PING ${ipfsdBId}`)
    expect(result[1]).to.match(/^Pong received: time=\d+ ms$/)
    expect(result[2]).to.match(/^Average latency: \d+(.\d+)?ms$/)
  })
})
