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

const isNode = require('detect-node')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const IPFSApi = require('../src')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

const expectedError = 'pubsub is currently not supported when run in the browser'

describe('.pubsub-browser (pubsub not supported in the browsers currently)', function () {
  this.timeout(50 * 1000)

  if (isNode) {
    it('skip these in Node.js')
    return
  }
  const topic = 'pubsub-tests'

  let ipfs
  let ipfsd

  before((done) => {
    df.spawn((err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = IPFSApi(_ipfsd.apiAddr)
      done()
    })
  })

  after((done) => ipfsd.stop(done))

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
          ipfs.pubsub.subscribe(topic, {}, handler, (err, topics) => {
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
          ipfs.pubsub.subscribe(topic, {}, handler)
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
        try {
          ipfs.pubsub.unsubscribe()
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
