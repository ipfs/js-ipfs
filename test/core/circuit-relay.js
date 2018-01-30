/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const parallel = require('async/parallel')
const series = require('async/series')
const waterfall = require('async/waterfall')
const multiaddr = require('multiaddr')
const crypto = require('crypto')
const IPFS = require('../../src')

const DaemonFactory = require('ipfsd-ctl')
const procDf = DaemonFactory.create({ type: 'proc', exec: IPFS })

const baseConf = {
  Bootstrap: [],
  Addresses: {
    API: '/ip4/0.0.0.0/tcp/0',
    Gateway: '/ip4/0.0.0.0/tcp/0'
  },
  Discovery: {
    MDNS: {
      Enabled:
        false
    }
  }
}

function setupInProcNode (addrs, hop, callback) {
  if (typeof hop === 'function') {
    callback = hop
    hop = false
  }

  procDf.spawn({
    config: Object.assign({}, baseConf, {
      Addresses: {
        Swarm: addrs
      },
      EXPERIMENTAL: {
        relay: {
          enabled: true,
          hop: {
            enabled: hop
          }
        }
      }
    })
  }, (err, ipfsd) => {
    expect(err).to.not.exist()
    ipfsd.api.id((err, id) => {
      callback(err, { ipfsd, addrs: id.addresses })
    })
  })
}

const wsAddr = (addrs) => addrs.map((a) => a.toString()).find((a) => a.includes('/ws'))
const tcpAddr = (addrs) => addrs.map((a) => a.toString()).find((a) => !a.includes('/ws'))

describe('circuit relay', () => {
  describe(`A <-> R <-> B`, function () {
    this.timeout(80 * 1000)

    let nodeA
    let nodeAAddr
    let nodeB
    let nodeBAddr
    let nodeBCircuitAddr

    let relayNode

    let nodes
    before(function (done) {
      parallel([
        (cb) => setupInProcNode([
          '/ip4/0.0.0.0/tcp/0',
          '/ip4/0.0.0.0/tcp/0/ws'
        ], true, cb),
        (cb) => setupInProcNode(['/ip4/0.0.0.0/tcp/0'], cb),
        (cb) => setupInProcNode(['/ip4/0.0.0.0/tcp/0/ws'], cb)
      ], function (err, res) {
        expect(err).to.not.exist()
        nodes = res.map((node) => node.ipfsd)

        relayNode = res[0].ipfsd

        nodeAAddr = tcpAddr(res[1].addrs)
        nodeA = res[0].ipfsd.api

        nodeBAddr = wsAddr(res[2].addrs)

        nodeB = res[1].ipfsd.api
        nodeBCircuitAddr = `/p2p-circuit/ipfs/${multiaddr(nodeBAddr).getPeerId()}`

        done()
      })
    })

    after((done) => parallel(nodes.map((node) => (cb) => node.stop(cb)), done))

    it('should connect', function (done) {
      series([
        (cb) => relayNode.api.swarm.connect(nodeAAddr, cb),
        (cb) => setTimeout(cb, 1000),
        (cb) => relayNode.api.swarm.connect(nodeBAddr, cb),
        (cb) => setTimeout(cb, 1000),
        (cb) => nodeA.swarm.connect(nodeBCircuitAddr, cb)
      ], done)
    })

    it('should transfer', function (done) {
      const data = crypto.randomBytes(128)
      waterfall([
        (cb) => nodeA.files.add(data, cb),
        (res, cb) => nodeB.files.cat(res[0].hash, cb),
        (buffer, cb) => {
          expect(buffer).to.deep.equal(data)
          cb()
        }
      ], done)
    })
  })
})
