/* eslint-env mocha */
/* eslint max-nested-callbacks: ['error', 8] */
'use strict'

const expect = require('chai').expect
const series = require('async/series')

module.exports = (common) => {
  describe('.pubsub', () => {
    const topic = 'pubsub-tests'

    describe('callback API', () => {
      let ipfs1
      let ipfs2

      before((done) => {
        // CI takes longer to instantiate the daemon,
        // so we need to increase the timeout for the
        // before step
        common.setup((err, factory) => {
          expect(err).to.not.exist
          series([
            (cb) => {
              factory.spawnNode((err, node) => {
                expect(err).to.not.exist
                ipfs1 = node
                ipfs1.id().then((res) => {
                  ipfs1.peerId = res.id
                  cb()
                })
              })
            },
            (cb) => {
              factory.spawnNode((err, node) => {
                expect(err).to.not.exist
                ipfs2 = node
                ipfs2.id().then((res) => {
                  ipfs2.peerId = res.id
                  cb()
                })
              })
            }
          ], done)
        })
      })

      after((done) => {
        common.teardown(done)
      })

      function waitForPeers (ipfs, peersToWait, callback) {
        const i = setInterval(() => {
          ipfs.pubsub.peers(topic, (err, peers) => {
            if (err) {
              return callback(err)
            }

            const hasAllPeers = peersToWait
                                  .map((e) => peers.includes(e))
                                  .filter((e) => e === false)
                                  .length === 0
            if (hasAllPeers) {
              clearInterval(i)
              callback()
            }
          })
        }, 1000)
      }

      describe('.publish', () => {
        it('message from string', (done) => {
          ipfs1.pubsub.publish(topic, 'hello friend', done)
        })

        it('message from buffer', (done) => {
          ipfs1.pubsub.publish(topic, new Buffer('hello friend'), done)
        })
      })

      describe('.subscribe', () => {
        it('to one topic', (done) => {
          ipfs1.pubsub.subscribe(topic, (err, subscription) => {
            expect(err).to.not.exist

            subscription.on('data', (msg) => {
              expect(msg.data).to.equal('hi')
              subscription.cancel(done)
            })

            ipfs1.pubsub.publish(topic, 'hi', (err) => {
              expect(err).to.not.exist
            })
          })
        })

        it('errors on double subscription', (done) => {
          series([
            (cb) => ipfs1.pubsub.subscribe(topic, cb),
            (cb) => ipfs1.pubsub.subscribe(topic, cb)
          ], (err, subs) => {
            expect(err).to.exist
            expect(err.toString())
              .to.eql(`Error: Already subscribed to '${topic}'`)
            subs[0].cancel(done)
          })
        })

        it('discover options', (done) => {
          ipfs1.pubsub.subscribe(topic, {
            discover: true
          }, (err, subscription) => {
            expect(err).to.not.exist
            subscription.cancel(done)
          })
        })
      })

      describe('subscription', () => {
        it('.cancel and wait for callback', (done) => {
          ipfs1.pubsub.subscribe(topic, (err, subscription) => {
            expect(err).to.not.exist
            subscription.cancel(done)
          })
        })

        it('.cancel and wait for end event', (done) => {
          ipfs1.pubsub.subscribe(topic, (err, subscription) => {
            expect(err).to.not.exist
            subscription.on('end', done)
            subscription.cancel()
          })
        })
      })

      describe('.peers', () => {
        // TODO clarify what is the goal of pubsub.peers
        it('returns an error when not subscribed to a topic', (done) => {
          ipfs1.pubsub.peers(topic, (err, peers) => {
            expect(err).to.exist
            expect(err.toString()).to.equal(`Error: Not subscribed to '${topic}'`)
            done()
          })
        })

        it.skip('returns no peers within 10 seconds', (done) => {
          // Currently go-ipfs returns peers that have not been
          // subscribed to the topic. Enable when go-ipfs has been fixed
          ipfs1.pubsub.subscribe(topic, (err, subscription) => {
            expect(err).to.not.exist

            setTimeout(() => {
              ipfs1.pubsub.peers(topic, (err, peers) => {
                expect(err).to.not.exist
                expect(peers.length).to.equal(0)
                subscription.cancel(done)
              })
            }, 10000)
          })
        })

        it.skip('doesn\'t return extra peers', (done) => {
          // Currently go-ipfs returns peers that have not been
          // subscribed to the topic. Enable when go-ipfs has been fixed
          ipfs1.pubsub.subscribe(topic, (err, subscription1) => {
            expect(err).to.not.exist

            ipfs2.pubsub.subscribe(topic + 'different topic', (err, subscription2) => {
              expect(err).to.not.exist

              setTimeout(() => {
                ipfs1.pubsub.peers(topic, (err, peers) => {
                  expect(err).to.not.exist
                  expect(peers.length).to.equal(0)

                  subscription1.cancel(() => {
                    subscription2.cancel(done)
                  })
                })
              }, 10000)
            })
          })
        })

        it.skip('returns peers for a topic - one peer', (done) => {
          // Currently go-ipfs returns peers that have not been subscribed to the topic
          // Enable when go-ipfs has been fixed
          const peersToWait = [ipfs2.peerId]

          ipfs2.pubsub.subscribe(topic, (err, subscription) => {
            expect(err).to.not.exist

            const i = setInterval(() => {
              ipfs1.pubsub.peers(topic, (err, peers) => {
                if (err) {
                  expect(err).to.not.exist
                  done(err)
                }

                console.log(peers)

                const hasAllPeers = peersToWait
                  .map((e) => peers.indexOf(e) !== -1)
                  .filter((e) => e === false)
                  .length === 0

                if (hasAllPeers) {
                  clearInterval(i)
                  expect(peers.length).to.equal(peersToWait.length)
                  subscription.cancel(done)
                }
              })
            }, 1000)
          })
        })

        it.skip('lists peers for a topic - multiple peers', (done) => {
          // TODO
        })
      })

      describe('.ls', () => {
        it('empty list when no topics are subscribed', (done) => {
          ipfs1.pubsub.ls((err, topics) => {
            expect(err).to.not.exist
            expect(topics.length).to.equal(0)
            done()
          })
        })

        it('list with 1 subscribed topic', (done) => {
          ipfs1.pubsub.subscribe(topic, (err, subscription) => {
            expect(err).to.not.exist

            ipfs1.pubsub.ls((err, topics) => {
              expect(err).to.not.exist
              expect(topics.length).to.equal(1)
              expect(topics[0]).to.equal(topic)
              subscription.cancel(done)
            })
          })
        })

        it('list with 3 subscribed topicss', (done) => {
          const topics = ['one', 'two', 'three']
          series(
            topics.map((t) => (cb) => ipfs1.pubsub.subscribe(t, cb))
          , (err, subs) => {
            expect(err).to.not.exist
            ipfs1.pubsub.ls((err, list) => {
              expect(err).to.not.exist
              expect(list.length).to.equal(3)
              expect(list).to.eql(topics)
              series(subs.map((s) => (cb) => s.cancel(cb)), done)
            })
          })
        })
      })

      describe('multiple nodes', () => {
        it('receive messages from different node', (done) => {
          const expectedString = 'hello from the other side'

          ipfs1.pubsub.subscribe(topic, (err, subscription) => {
            expect(err).to.not.exist
            expect(subscription).to.exist

            subscription.on('data', (d) => {
              expect(d.data).to.be.equal(expectedString)
              subscription.cancel(done)
            })

            waitForPeers(ipfs2, [ipfs1.peerId], (err) => {
              expect(err).to.not.exist
              ipfs2.pubsub.publish(topic, expectedString, (err) => {
                expect(err).to.not.exist
              })
            })
          })
        })

        it('receive multiple messages', (done) => {
          let receivedMessages = []
          const expectedMessages = 2

          ipfs1.pubsub.subscribe(topic, (err, subscription) => {
            expect(err).to.not.exists

            subscription.on('data', (d) => {
              receivedMessages.push(d.data)
              if (receivedMessages.length === expectedMessages) {
                receivedMessages.forEach((msg) => {
                  expect(msg).to.be.equal('hi')
                })
                subscription.cancel(done)
              }
            })

            waitForPeers(ipfs2, [ipfs1.peerId], (err) => {
              expect(err).to.not.exist
              ipfs2.pubsub.publish(topic, 'hi')
              ipfs2.pubsub.publish(topic, 'hi')
            })
          })
        })
      })

      describe('load tests', () => {
        it('send/receive 10k messages', (done) => {
          const expectedString = 'hello'
          const count = 10000
          let sendCount = 0
          let receivedCount = 0
          let startTime

          ipfs1.pubsub.subscribe(topic, (err, subscription) => {
            expect(err).to.not.exists

            const outputProgress = () => {
              process.stdout.write('                                                                        \r')
              process.stdout.write('Sent: ' + sendCount + ' of ' + count + ', Received: ' + receivedCount + '\r')
            }

            subscription.on('data', (d) => {
              expect(d.data).to.be.equal(expectedString)
              receivedCount++
              outputProgress()
              if (receivedCount >= count) {
                const duration = new Date().getTime() - startTime
                process.stdout.write('                                                                        \r')
                console.log(`Send/Receive 10k messages took: ${duration} ms, ${Math.floor(count / (duration / 1000))} ops / s`)
                subscription.cancel(done)
              }
            })

            function loop () {
              if (sendCount < count) {
                sendCount++
                outputProgress()
                ipfs2.pubsub.publish(topic, expectedString, (err) => {
                  expect(err).to.not.exist
                  process.nextTick(() => loop())
                })
              }
            }

            waitForPeers(ipfs1, [ipfs2.peerId], (err) => {
              expect(err).to.not.exist
              startTime = new Date().getTime()
              loop()
            })
          })
        })

        it('call publish 1k times', (done) => {
          const expectedString = 'hello'
          const count = 1000
          let sendCount = 0

          function loop () {
            if (sendCount < count) {
              sendCount++
              process.stdout.write('                                               \r')
              process.stdout.write('Sending messages: ' + sendCount + ' of ' + count + '\r')
              ipfs1.pubsub.publish(topic, expectedString, (err) => {
                expect(err).to.not.exist
                process.nextTick(() => loop())
              })
            } else {
              done()
            }
          }
          loop()
        })

        it('call subscribe 1k times', (done) => {
          const count = 1000
          let sendCount = 0
          let receivedCount = 0
          let subscription = null

          function loop () {
            if (sendCount < count) {
              sendCount++
              process.stdout.write('                                               \r')
              process.stdout.write('Subscribing: ' + sendCount + ' of ' + count + '\r')
              ipfs1.pubsub.subscribe(topic, (err, res) => {
                receivedCount++
                // First call should go through normally
                if (receivedCount === 1) {
                  expect(err).to.not.exist
                  expect(res).to.exist
                  subscription = res
                } else {
                  // Subsequent calls should return "error, duplicate subscription"
                  expect(err).to.exist
                }
                process.nextTick(() => loop())
              })
            } else {
              subscription.cancel(done)
            }
          }
          loop()
        })

        it('subscribe/unsubscribe 1k times', (done) => {
          const count = 1000
          let sendCount = 0
          let receivedCount = 0

          function outputProgress () {
            process.stdout.write('                                                                                 \r')
            process.stdout.write('Subscribe: ' + sendCount + ' of ' + count + ', Unsubscribe: ' + receivedCount + '\r')
          }

          function loop () {
            if (sendCount < count) {
              sendCount++
              outputProgress()
              ipfs1.pubsub.subscribe(topic, (err, subscription) => {
                expect(err).to.not.exist
                subscription.cancel((err) => {
                  expect(err).to.not.exist
                  receivedCount++
                  outputProgress()
                  process.nextTick(() => loop())
                })
              })
            } else {
              done()
            }
          }
          loop()
        })
      })
    })

    describe('promise API', () => {
      let ipfs1
      let ipfs2

      before((done) => {
        // CI takes longer to instantiate the daemon,
        // so we need to increase the timeout for the
        // before step
        common.setup((err, factory) => {
          expect(err).to.not.exist
          series([
            (cb) => {
              factory.spawnNode((err, node) => {
                expect(err).to.not.exist
                ipfs1 = node
                ipfs1.id().then((res) => {
                  ipfs1.peerId = res.id
                  cb()
                })
              })
            },
            (cb) => {
              factory.spawnNode((err, node) => {
                expect(err).to.not.exist
                ipfs2 = node
                ipfs2.id().then((res) => {
                  ipfs2.peerId = res.id
                  cb()
                })
              })
            }
          ], done)
        })
      })

      after((done) => {
        common.teardown(done)
      })

      it('.subscribe', () => {
        return ipfs1.pubsub.subscribe(topic)
          .then((subscription) => {
            expect(subscription).to.exist
            return subscription.cancel()
          })
      })

      it('.publish', () => {
        return ipfs1.pubsub.subscribe(topic)
          .then((subscription) => {
            return ipfs1.pubsub.publish(topic, 'hi').then(() => subscription)
          })
          .then((subscription) => subscription.cancel())
      })

      it('.cancel', () => {
        return ipfs1.pubsub.subscribe(topic)
          .then((subscription) => subscription.cancel())
      })

      it('.peers', () => {
        let s
        return ipfs1.pubsub.subscribe(topic)
          .then((subscription) => {
            s = subscription
            return ipfs1.pubsub.peers(topic)
          })
          .then((peers) => {
            expect(peers).to.exist
            return s.cancel()
          })
      })

      it('.ls', () => {
        return ipfs1.pubsub.ls()
          .then((topics) => {
            expect(topics).to.exist
            expect(topics.length).to.equal(0)
          })
      })
    })
  })
}
