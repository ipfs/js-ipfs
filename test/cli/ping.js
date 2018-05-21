/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const series = require('async/series')
const DaemonFactory = require('ipfsd-ctl')
const ipfsExec = require('../utils/ipfs-exec')

const df = DaemonFactory.create({ type: 'js' })
const expect = chai.expect
chai.use(dirtyChai)

const config = {
  Bootstrap: [],
  Discovery: {
    MDNS: {
      Enabled:
        false
    }
  }
}

describe('ping', function () {
  this.timeout(60 * 1000)
  let ipfsdA
  let ipfsdB
  let bMultiaddr
  let ipfsdBId
  let cli

  before((done) => {
    this.timeout(60 * 1000)
    series([
      (cb) => {
        df.spawn({
          exec: `./src/cli/bin.js`,
          config,
          initOptions: { bits: 512 }
        }, (err, _ipfsd) => {
          expect(err).to.not.exist()
          ipfsdB = _ipfsd
          cb()
        })
      },
      (cb) => {
        ipfsdB.api.id((err, peerInfo) => {
          expect(err).to.not.exist()
          ipfsdBId = peerInfo.id
          bMultiaddr = peerInfo.addresses[0]
          cb()
        })
      }
    ], done)
  })

  before(function (done) {
    this.timeout(60 * 1000)

    df.spawn({
      exec: './src/cli/bin.js',
      config,
      initoptions: { bits: 512 }
    }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsdA = _ipfsd
      // Without DHT we need to have an already established connection
      ipfsdA.api.swarm.connect(bMultiaddr, done)
    })
  })

  before((done) => {
    this.timeout(60 * 1000)
    cli = ipfsExec(ipfsdA.repoPath)
    done()
  })

  after((done) => {
    if (!ipfsdA) return done()
    ipfsdA.stop(done)
  })

  after((done) => {
    if (!ipfsdB) return done()
    ipfsdB.stop(done)
  })

  it('ping host', (done) => {
    this.timeout(60 * 1000)
    const ping = cli(`ping ${ipfsdBId}`)
    const result = []
    ping.stdout.on('data', (output) => {
      const packets = output.toString().split('\n').slice(0, -1)
      result.push(...packets)
    })

    ping.stdout.on('end', () => {
      expect(result).to.have.lengthOf(12)
      expect(result[0]).to.equal(`PING ${ipfsdBId}`)
      for (let i = 1; i < 11; i++) {
        expect(result[i]).to.match(/^Pong received: time=\d+ ms$/)
      }
      expect(result[11]).to.match(/^Average latency: \d+(.\d+)?ms$/)
      done()
    })

    ping.catch((err) => {
      expect(err).to.not.exist()
    })
  })

  it('ping host with --n option', (done) => {
    this.timeout(60 * 1000)
    const ping = cli(`ping --n 1 ${ipfsdBId}`)
    const result = []
    ping.stdout.on('data', (output) => {
      const packets = output.toString().split('\n').slice(0, -1)
      result.push(...packets)
    })

    ping.stdout.on('end', () => {
      expect(result).to.have.lengthOf(3)
      expect(result[0]).to.equal(`PING ${ipfsdBId}`)
      expect(result[1]).to.match(/^Pong received: time=\d+ ms$/)
      expect(result[2]).to.match(/^Average latency: \d+(.\d+)?ms$/)
      done()
    })

    ping.catch((err) => {
      expect(err).to.not.exist()
    })
  })

  it('ping host with --count option', (done) => {
    this.timeout(60 * 1000)
    const ping = cli(`ping --count 1 ${ipfsdBId}`)
    const result = []
    ping.stdout.on('data', (output) => {
      const packets = output.toString().split('\n').slice(0, -1)
      result.push(...packets)
    })

    ping.stdout.on('end', () => {
      expect(result).to.have.lengthOf(3)
      expect(result[0]).to.equal(`PING ${ipfsdBId}`)
      expect(result[1]).to.match(/^Pong received: time=\d+ ms$/)
      expect(result[2]).to.match(/^Average latency: \d+(.\d+)?ms$/)
      done()
    })

    ping.catch((err) => {
      expect(err).to.not.exist()
    })
  })
})
