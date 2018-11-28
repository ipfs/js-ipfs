/*
  We currently don't support pubsub when run in the browser,
  and we test it with separate set of tests to make sure
  if it's being used in the browser, pubsub errors.

  More info: https://github.com/ipfs/js-ipfs-http-client/issues/518

  This means:
  - You can use pubsub from js-ipfs-http-client in Node.js
  - You can use pubsub from js-ipfs-http-client in Electron
    (when js-ipfs-http-client is ran in the main process of Electron)

  - You can't use pubsub from js-ipfs-http-client in the browser
  - You can't use pubsub from js-ipfs-http-client in Electron's
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

const isNode = require('detect-node')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const ipfsClient = require('../src')
const f = require('./utils/factory')

const expectedError = 'pubsub is currently not supported when run in the browser'

describe('.pubsub is not supported in the browser, yet!', function () {
  this.timeout(50 * 1000)

  if (isNode) { return }

  const topic = 'pubsub-tests'
  let ipfs
  let ipfsd

  before((done) => {
    f.spawn({ initOptions: { bits: 1024 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = ipfsClient(_ipfsd.apiAddr)
      done()
    })
  })

  after((done) => {
    if (!ipfsd) return done()
    ipfsd.stop(done)
  })

  describe('everything errors', () => {
    describe('Callback API', () => {
      describe('.publish', () => {
        it('throws an error if called in the browser', (done) => {
          ipfs.pubsub.publish(topic, 'hello friend', (err, topics) => {
            expect(err).to.exist()
            expect(err.message).to.equal(expectedError)
            done()
          })
        })
      })

      describe('.subscribe', () => {
        const handler = () => {}
        it('throws an error if called in the browser', (done) => {
          ipfs.pubsub.subscribe(topic, handler, {}, (err, topics) => {
            expect(err).to.exist()
            expect(err.message).to.equal(expectedError)
            done()
          })
        })
      })

      describe('.peers', () => {
        it('throws an error if called in the browser', (done) => {
          ipfs.pubsub.peers(topic, (err, topics) => {
            expect(err).to.exist()
            expect(err.message).to.equal(expectedError)
            done()
          })
        })
      })

      describe('.ls', () => {
        it('throws an error if called in the browser', (done) => {
          ipfs.pubsub.ls((err, topics) => {
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
          return ipfs.pubsub.publish(topic, 'hello friend')
            .catch((err) => {
              expect(err).to.exist()
              expect(err.message).to.equal(expectedError)
            })
        })
      })

      describe('.subscribe', () => {
        const handler = () => {}
        it('throws an error if called in the browser', (done) => {
          ipfs.pubsub.subscribe(topic, handler, {})
            .catch((err) => {
              expect(err).to.exist()
              expect(err.message).to.equal(expectedError)
              done()
            })
        })
      })

      describe('.peers', () => {
        it('throws an error if called in the browser', (done) => {
          ipfs.pubsub.peers(topic)
            .catch((err) => {
              expect(err).to.exist()
              expect(err.message).to.equal(expectedError)
              done()
            })
        })
      })

      describe('.ls', () => {
        it('throws an error if called in the browser', () => {
          return ipfs.pubsub.ls()
            .catch((err) => {
              expect(err).to.exist()
              expect(err.message).to.equal(expectedError)
            })
        })
      })
    })

    describe('.unsubscribe', () => {
      it('throws an error if called in the browser', (done) => {
        ipfs.pubsub.unsubscribe('test', () => {}, (err) => {
          expect(err).to.exist()
          expect(err.message).to.equal(expectedError)
          done()
        })
      })
    })
  })
})
