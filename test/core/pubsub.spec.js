/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const parallel = require('async/parallel')
const times = require('async/times')
const waterfall = require('async/waterfall')
const isNode = require('detect-node')
const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'js' })

function connectNodes (localNode, remoteNode, callback) {
  remoteNode.id((err, peerInfo) => {
    expect(err).to.not.exist()

    localNode.swarm.connect(peerInfo.addresses[0], (err) => {
      callback(err)
    })
  })
}

function startNode (callback) {
  df.spawn({
    exec: './src/cli/bin.js',
    args: ['--enable-pubsub-experiment']
  }, callback)
}

function waitForSubscriber (sender, receiver, topic, callback) {
  parallel([
    (callback) => sender.id(callback),
    (callback) => receiver.id(callback)
  ], (err, [senderId, receiverId]) => {
    expect(err).to.not.exist()

    const waitForMs = 30000
    const timeout = setTimeout(() => {
      clearInterval(interval)
      callback(new Error(`Timed out waiting for subscribers after ${waitForMs}ms`))
    }, waitForMs)

    const interval = setInterval(() => {
      sender.pubsub.peers(topic, (err, peers) => {
        expect(err).to.not.exist()

        if (peers.includes(receiverId.id)) {
          clearInterval(interval)
          clearTimeout(timeout)
          callback()
        }
      })
    }, 100)
  })
}

describe('pubsub', function () {
  if (!isNode) {
    return it.skip('pubsub is not supported in the browser', () => {})
  }

  this.timeout(60 * 1000)

  let topic = 'Topic name'
  const message = 'Hello world'
  const callback = (err) => {
    expect(err).to.not.exist()
  }

  let nodes
  let remoteNode
  let localNode

  before((done) => {
    times(2, (_, callback) => {
      startNode(callback)
    }, (err, _nodes) => {
      expect(err).to.not.exist()

      nodes = _nodes

      localNode = nodes[0].api
      remoteNode = nodes[1].api

      parallel([
        (callback) => connectNodes(localNode, remoteNode, callback),
        (callback) => connectNodes(remoteNode, localNode, callback)
      ], done)
    })
  })

  after((done) => {
    parallel(nodes.map((node) => (callback) => node.stop(callback)), done)
  })

  beforeEach(function () {
    topic += ` ${Date.now()}`
  })

  describe('ls', () => {
    it('should list subscriptions via callbacks', (done) => {
      const handler = () => {}

      waterfall([
        (next) => localNode.pubsub.ls(next),
        (subscriptions, next) => {
          expect(subscriptions).to.be.empty()
          localNode.pubsub.subscribe(topic, handler, next)
        },
        (next) => localNode.pubsub.ls(next),
        (subscriptions, next) => {
          expect(subscriptions).to.contain(topic)
          localNode.pubsub.unsubscribe(topic, handler)
          next()
        }
      ], done)
    })

    it('should list subscriptions via promises', () => {
      const handler = () => {}

      return localNode.pubsub.ls()
        .then(subscriptions => expect(subscriptions).to.be.empty())
        .then(() => localNode.pubsub.subscribe(topic, handler))
        .then(() => localNode.pubsub.ls())
        .then(subscriptions => expect(subscriptions).to.contain(topic))
    })
  })

  describe('subscribe', () => {
    it('should subscribe', (done) => {
      const options = {}
      const handler = (event) => {
        expect(event.data.toString('utf8')).to.equal(message)
        done()
      }

      waterfall([
        (next) => localNode.pubsub.subscribe(topic, options, handler, next),
        (next) => waitForSubscriber(remoteNode, localNode, topic, next),
        (next) => remoteNode.pubsub.publish(topic, Buffer.from(message, 'utf8'), next)
      ], (err) => {
        expect(err).to.not.exist()
      })
    })

    it('should subscribe without options', (done) => {
      const handler = (event) => {
        expect(event.data.toString('utf8')).to.equal(message)
        done()
      }

      waterfall([
        (next) => localNode.pubsub.subscribe(topic, handler, next),
        (next) => waitForSubscriber(remoteNode, localNode, topic, next),
        (next) => remoteNode.pubsub.publish(topic, Buffer.from(message, 'utf8'), next)
      ], (err) => {
        expect(err).to.not.exist()
      })
    })

    it('should subscribe without options or callback', (done) => {
      const handler = (event) => {
        expect(event.data.toString('utf8')).to.equal(message)
        done()
      }

      localNode.pubsub.subscribe(topic, handler)
      waitForSubscriber(remoteNode, localNode, topic, (err) => {
        expect(err).to.not.exist()

        remoteNode.pubsub.publish(topic, Buffer.from(message, 'utf8'), callback)
      })
    })

    it('should subscribe and await promise completion', (done) => {
      const handler = (event) => {
        expect(event.data.toString('utf8')).to.equal(message)
        done()
      }

      localNode.pubsub.subscribe(topic, handler)
        .then(() => {
          waitForSubscriber(remoteNode, localNode, topic, (err) => {
            expect(err).to.not.exist()

            remoteNode.pubsub.publish(topic, Buffer.from(message, 'utf8'), callback)
          })
        })
        .catch(done)
    })
  })

  describe('unsubscribe', () => {
    it('should unsubscribe', (done) => {
      const handler = () => {
        done(new Error('Should not have received message'))
      }

      localNode.pubsub.subscribe(topic, handler)
      localNode.pubsub.unsubscribe(topic, handler)
      localNode.pubsub.publish(topic, Buffer.from(message, 'utf8'), (err) => {
        expect(err).to.not.exist()
        done()
      })
    })
  })
})
