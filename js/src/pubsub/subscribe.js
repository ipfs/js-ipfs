/* eslint-env mocha */
'use strict'

const series = require('async/series')
const parallel = require('async/parallel')
const timesSeries = require('async/timesSeries')
const { spawnNodesWithId } = require('../utils/spawn')
const { waitForPeers, makeCheck, getTopic } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { connect } = require('../utils/swarm')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.pubsub.subscribe', function () {
    this.timeout(80 * 1000)

    let ipfs1
    let ipfs2

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(100 * 1000)

      common.setup((err, factory) => {
        if (err) return done(err)

        spawnNodesWithId(2, factory, (err, nodes) => {
          if (err) return done(err)

          ipfs1 = nodes[0]
          ipfs2 = nodes[1]

          done()
        })
      })
    })

    after((done) => common.teardown(done))

    describe('single node', () => {
      it('should subscribe to one topic', (done) => {
        const check = makeCheck(2, done)
        const topic = getTopic()

        const handler = (msg) => {
          expect(msg.data.toString()).to.equal('hi')
          expect(msg).to.have.property('seqno')
          expect(Buffer.isBuffer(msg.seqno)).to.eql(true)
          expect(msg).to.have.property('topicIDs').eql([topic])
          expect(msg).to.have.property('from', ipfs1.peerId.id)

          ipfs1.pubsub.unsubscribe(topic, handler, (err) => {
            expect(err).to.not.exist()

            ipfs1.pubsub.ls((err, topics) => {
              expect(err).to.not.exist()
              expect(topics).to.be.empty()
              check()
            })
          })
        }

        ipfs1.pubsub.subscribe(topic, handler, (err) => {
          expect(err).to.not.exist()
          ipfs1.pubsub.publish(topic, Buffer.from('hi'), check)
        })
      })

      it('should subscribe to one topic (promised)', (done) => {
        const check = makeCheck(2, done)
        const topic = getTopic()

        const handler = (msg) => {
          expect(msg.data.toString()).to.equal('hi')
          expect(msg).to.have.property('seqno')
          expect(Buffer.isBuffer(msg.seqno)).to.eql(true)
          expect(msg).to.have.property('topicIDs').eql([topic])
          expect(msg).to.have.property('from', ipfs1.peerId.id)

          ipfs1.pubsub.unsubscribe(topic, handler, (err) => {
            expect(err).to.not.exist()

            ipfs1.pubsub.ls((err, topics) => {
              expect(err).to.not.exist()
              expect(topics).to.be.empty()
              check()
            })
          })
        }

        ipfs1.pubsub
          .subscribe(topic, handler)
          .then(() => ipfs1.pubsub.publish(topic, Buffer.from('hi'), check))
          .catch((err) => expect(err).to.not.exist())
      })

      it('should subscribe to one topic with options', (done) => {
        const check = makeCheck(2, done)
        const topic = getTopic()

        const handler = (msg) => {
          expect(msg.data.toString()).to.equal('hi')
          expect(msg).to.have.property('seqno')
          expect(Buffer.isBuffer(msg.seqno)).to.eql(true)
          expect(msg).to.have.property('topicIDs').eql([topic])
          expect(msg).to.have.property('from', ipfs1.peerId.id)

          ipfs1.pubsub.unsubscribe(topic, handler, (err) => {
            expect(err).to.not.exist()

            ipfs1.pubsub.ls((err, topics) => {
              expect(err).to.not.exist()
              expect(topics).to.be.empty()
              check()
            })
          })
        }

        ipfs1.pubsub.subscribe(topic, handler, {}, (err) => {
          expect(err).to.not.exist()
          ipfs1.pubsub.publish(topic, Buffer.from('hi'), check)
        })
      })

      it('should subscribe to one topic with options (promised)', (done) => {
        const check = makeCheck(2, done)
        const topic = getTopic()

        const handler = (msg) => {
          expect(msg.data.toString()).to.equal('hi')
          expect(msg).to.have.property('seqno')
          expect(Buffer.isBuffer(msg.seqno)).to.eql(true)
          expect(msg).to.have.property('topicIDs').eql([topic])
          expect(msg).to.have.property('from', ipfs1.peerId.id)

          ipfs1.pubsub.unsubscribe(topic, handler, (err) => {
            expect(err).to.not.exist()

            ipfs1.pubsub.ls((err, topics) => {
              expect(err).to.not.exist()
              expect(topics).to.be.empty()
              check()
            })
          })
        }

        ipfs1.pubsub
          .subscribe(topic, handler, {})
          .then(() => ipfs1.pubsub.publish(topic, Buffer.from('hi'), check))
          .catch((err) => expect(err).to.not.exist())
      })

      it('should subscribe to topic multiple times with different handlers', (done) => {
        const topic = getTopic()

        const check = makeCheck(3, done)
        const handler1 = (msg) => {
          expect(msg.data.toString()).to.eql('hello')

          series([
            (cb) => ipfs1.pubsub.unsubscribe(topic, handler1, cb),
            (cb) => ipfs1.pubsub.ls(cb),
            (cb) => ipfs1.pubsub.unsubscribe(topic, handler2, cb),
            (cb) => ipfs1.pubsub.ls(cb)
          ], (err, res) => {
            expect(err).to.not.exist()

            // Still subscribed as there is one listener left
            expect(res[1]).to.eql([topic])
            // Now all listeners are gone no subscription anymore
            expect(res[3]).to.eql([])
            check()
          })
        }

        const handler2 = (msg) => {
          expect(msg.data.toString()).to.eql('hello')
          check()
        }

        series([
          (cb) => ipfs1.pubsub.subscribe(topic, handler1, cb),
          (cb) => ipfs1.pubsub.subscribe(topic, handler2, cb)
        ], (err) => {
          expect(err).to.not.exist()
          ipfs1.pubsub.publish(topic, Buffer.from('hello'), check)
        })
      })

      it('should allow discover option to be passed', (done) => {
        const check = makeCheck(2, done)
        const topic = getTopic()

        const handler = (msg) => {
          expect(msg.data.toString()).to.eql('hi')
          ipfs1.pubsub.unsubscribe(topic, handler, check)
        }

        ipfs1.pubsub.subscribe(topic, handler, { discover: true }, (err) => {
          expect(err).to.not.exist()
          ipfs1.pubsub.publish(topic, Buffer.from('hi'), check)
        })
      })
    })

    describe('multiple connected nodes', () => {
      before((done) => {
        if (ipfs1.pubsub.setMaxListeners) {
          ipfs1.pubsub.setMaxListeners(100)
        }

        if (ipfs2.pubsub.setMaxListeners) {
          ipfs2.pubsub.setMaxListeners(100)
        }

        const ipfs2Addr = ipfs2.peerId.addresses.find((a) => a.includes('127.0.0.1'))
        connect(ipfs1, ipfs2Addr, done)
      })

      let topic
      let sub1
      let sub2

      beforeEach(() => {
        topic = getTopic()
      })

      afterEach((done) => {
        parallel([
          (cb) => ipfs1.pubsub.unsubscribe(topic, sub1, cb),
          (cb) => ipfs2.pubsub.unsubscribe(topic, sub2, cb)
        ], done)
      })

      it('should receive messages from a different node', (done) => {
        const check = makeCheck(3, done)
        const expectedString = 'hello from the other side'

        sub1 = (msg) => {
          expect(msg.data.toString()).to.be.eql(expectedString)
          expect(msg.from).to.eql(ipfs2.peerId.id)
          check()
        }

        sub2 = (msg) => {
          expect(msg.data.toString()).to.be.eql(expectedString)
          expect(msg.from).to.eql(ipfs2.peerId.id)
          check()
        }

        series([
          (cb) => ipfs1.pubsub.subscribe(topic, sub1, cb),
          (cb) => ipfs2.pubsub.subscribe(topic, sub2, cb),
          (cb) => waitForPeers(ipfs2, topic, [ipfs1.peerId.id], 30000, cb)
        ], (err) => {
          expect(err).to.not.exist()

          ipfs2.pubsub.publish(topic, Buffer.from(expectedString), check)
        })
      })

      it('should round trip a non-utf8 binary buffer', (done) => {
        const check = makeCheck(3, done)
        const expectedHex = 'a36161636179656162830103056164a16466666666f4'
        const buffer = Buffer.from(expectedHex, 'hex')

        sub1 = (msg) => {
          try {
            expect(msg.data.toString('hex')).to.be.eql(expectedHex)
            expect(msg.from).to.eql(ipfs2.peerId.id)
            check()
          } catch (err) {
            check(err)
          }
        }

        sub2 = (msg) => {
          try {
            expect(msg.data.toString('hex')).to.eql(expectedHex)
            expect(msg.from).to.eql(ipfs2.peerId.id)
            check()
          } catch (err) {
            check(err)
          }
        }

        series([
          (cb) => ipfs1.pubsub.subscribe(topic, sub1, cb),
          (cb) => ipfs2.pubsub.subscribe(topic, sub2, cb),
          (cb) => waitForPeers(ipfs2, topic, [ipfs1.peerId.id], 30000, cb)
        ], (err) => {
          expect(err).to.not.exist()

          ipfs2.pubsub.publish(topic, buffer, check)
        })
      })

      it('should receive multiple messages', (done) => {
        const inbox1 = []
        const inbox2 = []
        const outbox = ['hello', 'world', 'this', 'is', 'pubsub']

        const check = makeCheck(outbox.length * 3, (err) => {
          expect(inbox1.sort()).to.eql(outbox.sort())
          expect(inbox2.sort()).to.eql(outbox.sort())

          done(err)
        })

        sub1 = (msg) => {
          inbox1.push(msg.data.toString())
          expect(msg.from).to.eql(ipfs2.peerId.id)
          check()
        }

        sub2 = (msg) => {
          inbox2.push(msg.data.toString())
          expect(msg.from).to.be.eql(ipfs2.peerId.id)
          check()
        }

        series([
          (cb) => ipfs1.pubsub.subscribe(topic, sub1, cb),
          (cb) => ipfs2.pubsub.subscribe(topic, sub2, cb),
          (cb) => waitForPeers(ipfs2, topic, [ipfs1.peerId.id], 30000, cb)
        ], (err) => {
          expect(err).to.not.exist()

          outbox.forEach((msg) => {
            ipfs2.pubsub.publish(topic, Buffer.from(msg), check)
          })
        })
      })

      it('send/receive 100 messages', function (done) {
        this.timeout(2 * 60 * 1000)

        const msgBase = 'msg - '
        const count = 100
        let receivedCount = 0
        let startTime
        let counter = 0

        sub1 = (msg) => {
          // go-ipfs can't send messages in order when there are
          // only two nodes in the same machine ¯\_(ツ)_/¯
          // https://github.com/ipfs/js-ipfs-api/pull/493#issuecomment-289499943
          // const expectedMsg = msgBase + receivedCount
          // const receivedMsg = msg.data.toString()
          // expect(receivedMsg).to.eql(expectedMsg)

          receivedCount++

          if (receivedCount >= count) {
            const duration = new Date().getTime() - startTime
            const opsPerSec = Math.floor(count / (duration / 1000))

            console.log(`Send/Receive 100 messages took: ${duration} ms, ${opsPerSec} ops / s`)

            check()
          }
        }

        sub2 = (msg) => {}

        function check () {
          if (++counter === 2) {
            done()
          }
        }

        series([
          (cb) => ipfs1.pubsub.subscribe(topic, sub1, cb),
          (cb) => ipfs2.pubsub.subscribe(topic, sub2, cb),
          (cb) => waitForPeers(ipfs1, topic, [ipfs2.peerId.id], 30000, cb)
        ], (err) => {
          expect(err).to.not.exist()
          startTime = new Date().getTime()

          timesSeries(count, (sendCount, cb) => {
            const msgData = Buffer.from(msgBase + sendCount)
            ipfs2.pubsub.publish(topic, msgData, cb)
          }, check)
        })
      })
    })
  })
}
