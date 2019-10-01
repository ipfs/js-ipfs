/* eslint max-nested-callbacks: ["error", 7] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const path = require('path')
const parallel = require('async/parallel')
const ipfsExec = require('../utils/ipfs-exec')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({
  type: 'js',
  IpfsClient: require('ipfs-http-client')
})

const spawnDaemon = () => df.spawn({
  exec: path.resolve(`${__dirname}/../../src/cli/bin.js`),
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
})

describe('name-pubsub', () => {
  describe('enabled', () => {
    let ipfsA
    let ipfsB
    let nodeAId
    let nodeBId
    let bMultiaddr
    const nodes = []

    // Spawn daemons
    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(80 * 1000)

      const nodeA = await spawnDaemon()
      ipfsA = ipfsExec(nodeA.repoPath)
      nodes.push(nodeA)

      const nodeB = await spawnDaemon()
      ipfsB = ipfsExec(nodeB.repoPath)
      nodes.push(nodeB)
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

    after(() => Promise.all(nodes.map((node) => node.stop())))

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

        return ipfsB.fail(`name resolve ${nodeAId.id}`)
          .then((err) => {
            expect(err.all).to.include('was not found')
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
  })

  describe('disabled', () => {
    let ipfsA
    let node

    // Spawn daemons
    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(80 * 1000)

      node = await df.spawn({
        exec: path.resolve(`${__dirname}/../../src/cli/bin.js`),
        config: {},
        initOptions: { bits: 512 }
      })
      ipfsA = ipfsExec(node.repoPath)
    })

    after(() => {
      if (node) {
        return node.stop()
      }
    })

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
          expect(err.stdout).to.have.string('IPNS pubsub subsystem is not enabled')
        })
    })

    it('should get error canceling a subscription', function () {
      return ipfsA('name pubsub cancel /ipns/QmSWxaPcGgf4TDnFEBDWz2JnbHywF14phmY9hNcAeBEK5v')
        .catch((err) => {
          expect(err).to.exist() // error as it is disabled
          expect(err.stdout).to.have.string('IPNS pubsub subsystem is not enabled')
        })
    })
  })
})
