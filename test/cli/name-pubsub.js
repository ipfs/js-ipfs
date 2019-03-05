/* eslint max-nested-callbacks: ["error", 7] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const parallel = require('async/parallel')
const series = require('async/series')
const ipfsExec = require('../utils/ipfs-exec')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'js' })

const checkAll = (bits) => string => bits.every(bit => string.includes(bit))
const emptyDirCid = 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'

const spawnDaemon = (callback) => {
  df.spawn({
    exec: `./src/cli/bin.js`,
    args: ['--enable-namesys-pubsub'],
    initOptions: { bits: 512 },
    config: {
      Bootstrap: [],
      Discovery: {
        MDNS: {
          Enabled: false
        },
        webRTCStar: {
          Enabled: false
        }
      }
    }
  }, callback)
}

describe('name-pubsub', () => {
  describe('enabled', () => {
    let ipfsA
    let ipfsB
    let nodeAId
    let nodeBId
    let bMultiaddr
    let nodes = []

    // Spawn daemons
    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(80 * 1000)

      series([
        (cb) => {
          spawnDaemon((err, node) => {
            expect(err).to.not.exist()
            ipfsA = ipfsExec(node.repoPath)
            nodes.push(node)
            cb()
          })
        },
        (cb) => {
          spawnDaemon((err, node) => {
            expect(err).to.not.exist()
            ipfsB = ipfsExec(node.repoPath)
            nodes.push(node)
            cb()
          })
        }
      ], done)
    })

    // Get node ids
    before(function (done) {
      parallel([
        (cb) => {
          ipfsA('id').then((res) => {
            nodeAId = JSON.parse(res)
            cb()
          })
        },
        (cb) => {
          ipfsB('id').then((res) => {
            const id = JSON.parse(res)

            nodeBId = id
            bMultiaddr = id.addresses[0]
            cb()
          })
        }
      ], done)
    })

    // Connect
    before(function () {
      return ipfsA('swarm', 'connect', bMultiaddr)
        .then((out) => {
          expect(out).to.eql(`connect ${bMultiaddr} success\n`)
        })
    })

    after((done) => parallel(nodes.map((node) => (cb) => node.stop(cb)), done))

    describe('pubsub commands', () => {
      it('should get enabled state of pubsub', function () {
        return ipfsA('name pubsub state')
          .then((res) => {
            expect(res).to.exist()
            expect(res).to.have.string('enabled') // enabled
          })
      })

      it('should subscribe on name resolve', function () {
        this.timeout(80 * 1000)

        return ipfsB(`name resolve ${nodeAId.id}`)
          .catch((err) => {
            expect(err).to.exist() // Not available (subscribed)

            return ipfsB('pubsub ls')
          })
          .then((res) => {
            expect(res).to.exist()
            expect(res).to.have.string('/record/') // have a record ipns subscribtion

            return ipfsB('name pubsub subs')
          })
          .then((res) => {
            expect(res).to.exist()
            expect(res).to.have.string(`/ipns/${nodeAId.id}`) // have subscription
          })
      })

      it('should be able to cancel subscriptions', function () {
        this.timeout(80 * 1000)

        return ipfsA(`name pubsub cancel /ipns/${nodeBId.id}`)
          .then((res) => {
            expect(res).to.exist()
            expect(res).to.have.string('no subscription') // tried to cancel a not yet subscribed id

            return ipfsA(`name resolve ${nodeBId.id}`)
          })
          .catch((err) => {
            expect(err).to.exist() // Not available (subscribed now)

            return ipfsA(`name pubsub cancel /ipns/${nodeBId.id}`)
          })
          .then((res) => {
            expect(res).to.exist()
            expect(res).to.have.string('canceled') // canceled now

            return ipfsA('pubsub ls')
          })
          .then((res) => {
            expect(res).to.exist()
            expect(res).to.not.have.string('/ipns/') // ipns subscribtion not available

            return ipfsA('name pubsub subs')
          })
          .then((res) => {
            expect(res).to.exist()
            expect(res).to.not.have.string(`/ipns/${nodeBId.id}`) // ipns subscribtion not available
          })
      })
    })

    describe('pubsub records', () => {
      let cidAdded

      before(function (done) {
        this.timeout(50 * 1000)
        ipfsA('add src/init-files/init-docs/readme')
          .then((out) => {
            cidAdded = out.split(' ')[1]
            done()
          })
      })

      it('should publish the received record to the subscriber', function () {
        this.timeout(80 * 1000)

        return ipfsB(`name resolve ${nodeBId.id}`)
          .then((res) => {
            expect(res).to.exist()
            expect(res).to.satisfy(checkAll([emptyDirCid])) // Empty dir received (subscribed)

            return ipfsA(`name resolve ${nodeBId.id}`)
          })
          .catch((err) => {
            expect(err).to.exist() // Not available (subscribed now)

            return ipfsB(`name publish ${cidAdded}`)
          })
          .then((res) => {
            // published to IpfsB and published through pubsub to ipfsa
            expect(res).to.exist()
            expect(res).to.satisfy(checkAll([cidAdded, nodeBId.id]))

            return ipfsB(`name resolve ${nodeBId.id}`)
          })
          .then((res) => {
            expect(res).to.exist()
            expect(res).to.satisfy(checkAll([cidAdded]))

            return ipfsA(`name resolve ${nodeBId.id}`)
          })
          .then((res) => {
            expect(res).to.exist()
            expect(res).to.satisfy(checkAll([cidAdded])) // value propagated to node B
          })
      })
    })
  })

  describe('disabled', () => {
    let ipfsA
    let nodes = []

    // Spawn daemons
    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(80 * 1000)

      df.spawn({
        exec: `./src/cli/bin.js`,
        config: {},
        initOptions: { bits: 512 }
      }, (err, node) => {
        expect(err).to.not.exist()
        ipfsA = ipfsExec(node.repoPath)
        nodes.push(node)
        done()
      })
    })

    after((done) => parallel(nodes.map((node) => (cb) => node.stop(cb)), done))

    it('should get disabled state of pubsub', function () {
      return ipfsA('name pubsub state')
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.have.string('disabled')
        })
    })

    it('should get error getting the available subscriptions', function () {
      return ipfsA('name pubsub subs')
        .catch((err) => {
          expect(err).to.exist() // error as it is disabled
          expect(err.toString()).to.have.string('IPNS pubsub subsystem is not enabled')
        })
    })

    it('should get error canceling a subscription', function () {
      return ipfsA('name pubsub cancel /ipns/QmSWxaPcGgf4TDnFEBDWz2JnbHywF14phmY9hNcAeBEK5v')
        .catch((err) => {
          expect(err).to.exist() // error as it is disabled
          expect(err.toString()).to.have.string('IPNS pubsub subsystem is not enabled')
        })
    })
  })
})
