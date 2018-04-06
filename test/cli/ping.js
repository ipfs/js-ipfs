/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const delay = require('delay')
const series = require('async/series')
const ipfsExec = require('../utils/ipfs-exec')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'js' })

const config = {
  Bootstrap: [],
  Discovery: {
    MDNS: {
      Enabled:
        false
    }
  }
}

describe.only('ping', function () {
  this.timeout(80 * 1000)

  let ipfsdA
  let ipfsdB
  let ipfsdBId
  let cli

  before(function (done) {
    this.timeout(60 * 1000)

    df.spawn({
      exec: './src/cli/bin.js',
      config,
      initoptions: { bits: 512 }
    }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsdA = _ipfsd
      done()
    })
  })

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
          console.log(peerInfo)
          ipfsdBId = peerInfo.id
          cb()
        })
      }
    ], done)
  })

  after((done) => ipfsdA.stop(done))
  after((done) => ipfsdB.stop(done))

  before((done) => {
    cli = ipfsExec(ipfsdA.repoPath)
    done()
  })

  it('ping host', (done) => {
    const ping = cli(`ping ${ipfsdBId}`)
    const result = []
    ping.stdout.on('data', (packet) => {
      console.log('ON DATA')
      result.push(packet.toString())
    })

    ping.stdout.on('end', (c) => {
      console.log('END', result)
      done()
    })

    ping.catch((err) => {
      expect(err).to.not.exist()
      done()
    })
  })
})
