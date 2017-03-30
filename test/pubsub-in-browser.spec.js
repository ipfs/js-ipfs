/*
  We currently don't support pubsub when run in the browser,
  and we test it with separate set of tests to make sure
  if it's being used in the browser, pubsub errors.

  More info: https://github.com/ipfs/js-ipfs-api/issues/518

  This means:
  - You can use pubsub from js-ipfs-api in Node.js
  - You can use pubsub from js-ipfs-api in Electron
    (when js-ipfs-api is ran in the main process of Electron)

  - You can't use pubsub from js-ipfs-api in the browser
  - You can't use pubsub from js-ipfs-api in Electron's
    renderer process

  - You can use pubsub from js-ipfs in the browsers
  - You can use pubsub from js-ipfs in Node.js
  - You can use pubsub from js-ipfs in Electron
    (in both the main process and the renderer process)
  - See https://github.com/ipfs/js-ipfs for details on
    pubsub in js-ipfs
*/

/* eslint-env mocha */
/* eslint max-nested-callbacks: ['error', 8] */
'use strict'

const series = require('async/series')
const waterfall = require('async/waterfall')
const isNode = require('detect-node')
const FactoryClient = require('./ipfs-factory/client')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const expectedError = 'pubsub is currently not supported when run in the browser'

function spawnWithId (factory, callback) {
  waterfall([
    (cb) => factory.spawnNode(cb),
    (node, cb) => node.id((err, res) => {
      if (err) {
        return cb(err)
      }
      node.peerId = res
      cb(null, node)
    })
  ], callback)
}

if (!isNode) {
  describe('.pubsub-browser (pubsub not supported in the browsers currently)', () => {
    const topic = 'pubsub-tests'

    let factory
    let ipfs1

    before((done) => {
      factory = new FactoryClient()

      series([
        (cb) => spawnWithId(factory, cb)
      ], (err, nodes) => {
        if (err) {
          return done(err)
        }

        ipfs1 = nodes[0]
        done()
      })
    })

    after((done) => {
      factory.dismantle(done)
    })

    describe('everything errors', () => {
      describe('Callback API', () => {
        describe('.publish', () => {
          it('throws an error if called in the browser', (done) => {
            ipfs1.pubsub.publish(topic, 'hello friend', (err, topics) => {
              expect(err).to.exist()
              expect(err.message).to.equal(expectedError)
              done()
            })
          })
        })

        describe('.subscribe', () => {
          const handler = () => {}
          it('throws an error if called in the browser', (done) => {
            ipfs1.pubsub.subscribe(topic, {}, handler, (err, topics) => {
              expect(err).to.exist()
              expect(err.message).to.equal(expectedError)
              done()
            })
          })
        })

        describe('.peers', () => {
          it('throws an error if called in the browser', (done) => {
            ipfs1.pubsub.peers(topic, (err, topics) => {
              expect(err).to.exist()
              expect(err.message).to.equal(expectedError)
              done()
            })
          })
        })

        describe('.ls', () => {
          it('throws an error if called in the browser', (done) => {
            ipfs1.pubsub.ls((err, topics) => {
              expect(err).to.exist()
              expect(err.message).to.equal(expectedError)
              done()
            })
          })
        })
      })

      describe('Promise API', () => {
        describe('.publish', () => {
          it('throws an error if called in the browser', () => {
            return ipfs1.pubsub.publish(topic, 'hello friend')
              .catch((err) => {
                expect(err).to.exist()
                expect(err.message).to.equal(expectedError)
              })
          })
        })

        describe('.subscribe', () => {
          const handler = () => {}
          it('throws an error if called in the browser', (done) => {
            ipfs1.pubsub.subscribe(topic, {}, handler)
              .catch((err) => {
                expect(err).to.exist()
                expect(err.message).to.equal(expectedError)
                done()
              })
          })
        })

        describe('.peers', () => {
          it('throws an error if called in the browser', (done) => {
            ipfs1.pubsub.peers(topic)
              .catch((err) => {
                expect(err).to.exist()
                expect(err.message).to.equal(expectedError)
                done()
              })
          })
        })

        describe('.ls', () => {
          it('throws an error if called in the browser', () => {
            return ipfs1.pubsub.ls()
              .catch((err) => {
                expect(err).to.exist()
                expect(err.message).to.equal(expectedError)
              })
          })
        })
      })

      describe('.unsubscribe', () => {
        it('throws an error if called in the browser', (done) => {
          try {
            ipfs1.pubsub.unsubscribe()
            done('unsubscribe() didn\'t throw an error')
          } catch (err) {
            expect(err).to.exist()
            expect(err.message).to.equal(expectedError)
            done()
          }
        })
      })
    })
  })
}
