/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const pull = require('pull-stream/pull')
const collect = require('pull-stream/sinks/collect')

const f = require('./utils/factory')

// Determine if a ping response object is a pong, or something else, like a status message
function isPong (pingResponse) {
  return Boolean(pingResponse && pingResponse.success && !pingResponse.text)
}

describe('.ping', function () {
  this.timeout(20 * 1000)

  let ipfs
  let other
  let otherId

  before(async function () {
    this.timeout(30 * 1000) // slow CI

    ipfs = (await f.spawn()).api
    other = (await f.spawn()).api

    const ma = (await ipfs.id()).addresses[0]
    await other.swarm.connect(ma)

    otherId = (await other.id()).id
  })

  after(() => f.clean())

  it('.ping with default count', async () => {
    const res = await ipfs.ping(otherId)
    expect(res).to.be.an('array')
    expect(res.filter(isPong)).to.have.lengthOf(10)
    res.forEach(packet => {
      expect(packet).to.have.keys('success', 'time', 'text')
      expect(packet.time).to.be.a('number')
    })
    const resultMsg = res.find(packet => packet.text.includes('Average latency'))
    expect(resultMsg).to.exist()
  })

  it('.ping with count = 2', async () => {
    const res = await ipfs.ping(otherId, { count: 2 })
    expect(res).to.be.an('array')
    expect(res.filter(isPong)).to.have.lengthOf(2)
    res.forEach(packet => {
      expect(packet).to.have.keys('success', 'time', 'text')
      expect(packet.time).to.be.a('number')
    })
    const resultMsg = res.find(packet => packet.text.includes('Average latency'))
    expect(resultMsg).to.exist()
  })

  it('.pingPullStream', (done) => {
    pull(
      ipfs.pingPullStream(otherId, { count: 2 }),
      collect((err, data) => {
        expect(err).to.not.exist()
        expect(data).to.be.an('array')
        expect(data.filter(isPong)).to.have.lengthOf(2)
        data.forEach(packet => {
          expect(packet).to.have.keys('success', 'time', 'text')
          expect(packet.time).to.be.a('number')
        })
        const resultMsg = data.find(packet => packet.text.includes('Average latency'))
        expect(resultMsg).to.exist()
        done()
      })
    )
  })

  it('.pingReadableStream', (done) => {
    let packetNum = 0
    ipfs.pingReadableStream(otherId, { count: 2 })
      .on('data', data => {
        expect(data).to.be.an('object')
        expect(data).to.have.keys('success', 'time', 'text')
        if (isPong(data)) packetNum++
      })
      .on('error', err => {
        expect(err).not.to.exist()
      })
      .on('end', () => {
        expect(packetNum).to.equal(2)
        done()
      })
  })
})
