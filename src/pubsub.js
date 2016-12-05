/* eslint-env mocha */
/* eslint max-nested-callbacks: ['error', 8] */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const series = require('async/series')

const topicName = 'js-ipfs-api-tests'

const publish = (ipfs, data, callback) => {
  ipfs.pubsub.publish(topicName, data, (err) => {
    expect(err).to.not.exist
    callback()
  })
}

const waitForPeers = (ipfs, peersToWait, callback) => {
  const i = setInterval(() => {
    ipfs.pubsub.peers(topicName, (err, peers) => {
      if (err) {
        return callback(err)
      }

      const hasAllPeers = peersToWait.map((e) => peers.includes(e)).filter((e) => e === false).length === 0
      if (hasAllPeers) {
        clearInterval(i)
        callback(null)
      }
    })
  }, 1000)
}

module.exports = (common) => {
  describe('.pubsub', () => {
    if (!isNode) {
      return
    }

    let ipfs, ipfs2

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
              ipfs = node
              ipfs.id().then((res) => {
                ipfs.PeerId = res.id
                cb()
              })
            })
          },
          (cb) => {
            factory.spawnNode((err, node) => {
              expect(err).to.not.exist
              ipfs2 = node
              ipfs2.id().then((res) => {
                ipfs2.PeerId = res.id
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

    describe('publish', () => {
      it('message from string', (done) => {
        publish(ipfs, 'hello friend', done)
      })

      it('message from buffer', (done) => {
        publish(ipfs, new Buffer('hello friend'), done)
      })
    })

    describe('subscribe', () => {
      it('one topic', (done) => {
        ipfs.pubsub.subscribe(topicName, (err, subscription) => {
          expect(err).to.not.exist

          subscription.on('data', (d) => {
            expect(d.data).to.equal('hi')
            subscription.cancel(done)
          })

          ipfs.pubsub.publish(topicName, 'hi', (err) => {
            expect(err).to.not.exist
          })
        })
      })

      it('cancels a subscription', (done) => {
        ipfs.pubsub.subscribe(topicName, (err, subscription) => {
          expect(err).to.not.exist
          subscription.cancel(done)
        })
      })

      it('closes the subscription stream', (done) => {
        ipfs.pubsub.subscribe(topicName, (err, subscription) => {
          expect(err).to.not.exist
          subscription.on('end', done)
          subscription.cancel()
        })
      })

      it('returns an error when already subscribed', (done) => {
        ipfs.pubsub.subscribe(topicName)
          .then((firstSub) => {
            ipfs.pubsub.subscribe(topicName)
              .then((secondSub) => {
                expect(secondSub).to.not.exist
                done("Shouldn't get here!")
              })
              .catch((secondErr) => {
                expect(secondErr).to.be.an('error')
                expect(secondErr.toString()).to.equal(`Error: Already subscribed to '${topicName}'`)
                firstSub.cancel(done)
              })
          })
          .catch(done)
      })

      it('takes options as an argument', (done) => {
        ipfs.pubsub.subscribe(topicName, { discover: true }, (err, subscription) => {
          expect(err).to.not.exist

          subscription.on('data', (d) => {
            expect(d.data).to.equal('hi')
            subscription.cancel(done)
          })

          ipfs.pubsub.publish(topicName, 'hi', (err) => {
            expect(err).to.not.exist
          })
        })
      })
    })

    describe('peers', () => {
      it('returns an error when not subscribed to a topic', (done) => {
        ipfs.pubsub.peers(topicName, (err, peers) => {
          expect(err).to.be.an('error')
          expect(err.toString()).to.equal(`Error: Not subscribed to '${topicName}'`)
          done()
        })
      })

      it.skip('returns no peers within 10 seconds', (done) => {
        // Currently go-ipfs returns peers that have not been subscribed to the topic
        // Enable when go-ipfs has been fixed
        ipfs.pubsub.subscribe(topicName, (err, subscription) => {
          expect(err).to.not.exist

          setTimeout(() => {
            ipfs.pubsub.peers(topicName, (err, peers) => {
              expect(err).to.not.exist
              expect(peers.length).to.equal(0)
              subscription.cancel(done)
            })
          }, 10000)
        })
      })

      it.skip('doesn\'t return extra peers', (done) => {
        // Currently go-ipfs returns peers that have not been subscribed to the topic
        // Enable when go-ipfs has been fixed
        ipfs.pubsub.subscribe(topicName, (err, subscription1) => {
          expect(err).to.not.exist

          ipfs2.pubsub.subscribe(topicName + 'different topic', (err, subscription2) => {
            expect(err).to.not.exist

            setTimeout(() => {
              ipfs.pubsub.peers(topicName, (err, peers) => {
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
        const peersToWait = [ipfs2.PeerId]

        ipfs2.pubsub.subscribe(topicName, (err, subscription) => {
          expect(err).to.not.exist

          const i = setInterval(() => {
            ipfs.pubsub.peers(topicName, (err, peers) => {
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

    describe('ls', () => {
      it('lists no subscribed topics', (done) => {
        ipfs.pubsub.ls((err, topics) => {
          expect(err).to.not.exist
          expect(topics.length).to.equal(0)
          done()
        })
      })

      it('lists 1 subscribed topic', (done) => {
        ipfs.pubsub.subscribe(topicName, (err, subscription) => {
          expect(err).to.not.exist

          ipfs.pubsub.ls((err, topics) => {
            expect(err).to.not.exist
            expect(topics.length).to.equal(1)
            expect(topics[0]).to.equal(topicName)
            subscription.cancel(done)
          })
        })
      })

      it('lists all subscribed topics', (done) => {
        let topics = ['one', 'two', 'three']
        let subscriptions = topics.map((e) => ipfs.pubsub.subscribe(e))
        Promise.all(subscriptions)
          .then((subscriptions) => {
            ipfs.pubsub.ls((err, result) => {
              expect(err).to.not.exist
              expect(result.length).to.equal(3)
              result.forEach((e) => {
                expect(topics.indexOf(e) !== -1).to.be.true
              })
              Promise.all(subscriptions.map((s) => s.cancel()))
                .then(() => done())
                .catch(done)
            })
          })
          .catch(done)
      })
    })

    describe('send and receive messages', () => {
      it('receive messages from different node', (done) => {
        const expectedString = 'hello from the other side'

        ipfs.pubsub.subscribe(topicName, (err, subscription) => {
          expect(err).to.not.exist
          expect(subscription).to.exist

          subscription.on('data', (d) => {
            expect(d.data).to.be.equal(expectedString)
            subscription.cancel(done)
          })

          waitForPeers(ipfs2, [ipfs.PeerId], (err) => {
            expect(err).to.not.exist
            ipfs2.pubsub.publish(topicName, expectedString, (err) => {
              expect(err).to.not.exist
            })
          })
        })
      })

      it('receive multiple messages', (done) => {
        let receivedMessages = []
        const expectedMessages = 2

        ipfs.pubsub.subscribe(topicName, (err, subscription) => {
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

          waitForPeers(ipfs2, [ipfs.PeerId], (err) => {
            expect(err).to.not.exist
            ipfs2.pubsub.publish(topicName, 'hi')
            ipfs2.pubsub.publish(topicName, 'hi')
          })
        })
      })
    })

    describe('promises', () => {
      it('subscribe', (done) => {
        ipfs.pubsub.subscribe(topicName)
          .then((subscription) => {
            expect(subscription).to.exist
            subscription.cancel(done)
          })
          .catch(done)
      })

      it('publish', (done) => {
        ipfs.pubsub.subscribe(topicName)
          .then((subscription) => {
            return ipfs.pubsub.publish(topicName, 'hi')
              .then(() => subscription)
          })
          .then((subscription) => subscription.cancel(done))
          .catch(done)
      })

      it('cancel subscription', (done) => {
        ipfs.pubsub.subscribe(topicName)
          .then((subscription) => subscription.cancel())
          .then(() => done())
          .catch(done)
      })

      it('peers', (done) => {
        let s
        ipfs.pubsub.subscribe(topicName)
          .then((subscription) => {
            s = subscription
            return ipfs.pubsub.peers(topicName)
          })
          .then((peers) => {
            expect(peers).to.exist
            s.cancel(done)
          })
          .catch(done)
      })

      it('topics', (done) => {
        ipfs.pubsub.ls()
          .then((topics) => {
            expect(topics).to.exist
            expect(topics.length).to.equal(0)
            done()
          })
          .catch(done)
      })
    })

    describe('load tests', () => {
      it('send/receive 10k messages', (done) => {
        const expectedString = 'hello'
        const count = 10000
        let sendCount = 0
        let receivedCount = 0
        let startTime

        ipfs.pubsub.subscribe(topicName, (err, subscription) => {
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

          const loop = () => {
            if (sendCount < count) {
              sendCount++
              outputProgress()
              ipfs2.pubsub.publish(topicName, expectedString, (err) => {
                expect(err).to.not.exist
                process.nextTick(() => loop())
              })
            }
          }

          waitForPeers(ipfs, [ipfs2.PeerId], (err) => {
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

        const loop = () => {
          if (sendCount < count) {
            sendCount++
            process.stdout.write('                                               \r')
            process.stdout.write('Sending messages: ' + sendCount + ' of ' + count + '\r')
            ipfs.pubsub.publish(topicName, expectedString, (err) => {
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

        const loop = () => {
          if (sendCount < count) {
            sendCount++
            process.stdout.write('                                               \r')
            process.stdout.write('Subscribing: ' + sendCount + ' of ' + count + '\r')
            ipfs.pubsub.subscribe(topicName, (err, res) => {
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

        const outputProgress = () => {
          process.stdout.write('                                                                                 \r')
          process.stdout.write('Subscribe: ' + sendCount + ' of ' + count + ', Unsubscribe: ' + receivedCount + '\r')
        }

        const loop = () => {
          if (sendCount < count) {
            sendCount++
            outputProgress()
            ipfs.pubsub.subscribe(topicName, (err, subscription) => {
              expect(err).to.not.exist
              subscription.cancel((err) => {
                receivedCount++
                outputProgress()
                expect(err).to.not.exist
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
}
