/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const delay = require('delay')
const series = require('async/series')
const InstanceFactory = require('../utils/ipfs-factory-instance')
const DaemonFactory = require('../utils/ipfs-factory-daemon')
const ipfsExec = require('../utils/ipfs-exec')

describe('pubsub', function () {
  this.timeout(30000)

  let instanceFactory
  let daemonFactory
  let node
  let cli
  let httpApi

  const topicA = 'nonscentsA'
  const topicB = 'nonscentsB'
  const topicC = 'nonscentsC'

  before((done) => {
    instanceFactory = new InstanceFactory()
    instanceFactory.spawnNode((err, _node) => {
      expect(err).to.not.exist()
      node = _node
      done()
    })
  })

  after((done) => instanceFactory.dismantle(done))

  before((done) => {
    daemonFactory = new DaemonFactory()
    daemonFactory.spawnNode((err, _node) => {
      expect(err).to.not.exist()
      httpApi = _node
      done()
    })
  })

  after((done) => daemonFactory.dismantle(done))

  before((done) => {
    cli = ipfsExec(httpApi.repoPath)
    done()
  })

  it('subscribe and publish', () => {
    const sub = cli(`pubsub sub ${topicA}`)

    sub.stdout.on('data', (c) => {
      expect(c.toString().trim()).to.be.eql('world')
      sub.kill()
    })

    return Promise.all([
      sub.catch(ignoreKill),
      delay(1000)
        .then(() => cli(`pubsub pub ${topicA} world`))
        .then((out) => {
          expect(out).to.be.eql('')
        })
    ])
  })

  it('ls', () => {
    const sub = cli(`pubsub sub ${topicB}`)

    sub.stdout.once('data', (data) => {
      expect(data.toString().trim()).to.be.eql('world')
      cli('pubsub ls')
        .then((out) => {
          expect(out.trim()).to.be.eql(topicB)
          sub.kill()
        })
    })

    return Promise.all([
      sub.catch(ignoreKill),
      delay(200)
        .then(() => cli(`pubsub pub ${topicB} world`))
    ])
  })

  it('peers', (done) => {
    let sub
    let instancePeerId
    let peerAddress
    const handler = (msg) => {
      expect(msg.data.toString()).to.be.eql('world')
      cli(`pubsub peers ${topicC}`)
        .then((out) => {
          expect(out.trim()).to.be.eql(instancePeerId)
          sub.kill()
          node.pubsub.unsubscribe(topicC, handler)
          done()
        })
    }

    series(
      [
        (cb) => httpApi.id((err, peerInfo) => {
          expect(err).to.not.exist()
          peerAddress = peerInfo.addresses[0]
          expect(peerAddress).to.exist()
          cb()
        }),
        (cb) => node.id((err, peerInfo) => {
          expect(err).to.not.exist()
          instancePeerId = peerInfo.id.toString()
          cb()
        }),
        (cb) => node.swarm.connect(peerAddress, cb),
        (cb) => node.pubsub.subscribe(topicC, handler, cb)
      ],
      (err) => {
        expect(err).to.not.exist()
        sub = cli(`pubsub sub ${topicC}`)

        return Promise.all([
          sub.catch(ignoreKill),
          delay(1000)
            .then(() => cli(`pubsub pub ${topicC} world`))
        ])
      })
  })
})

function ignoreKill (err) {
  if (!err.killed) {
    throw err
  }
}
