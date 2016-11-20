/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const HttpAPI = require('../../src/http-api')
const createTempNode = require('../utils/temp-node')
const repoPath = require('./index').repoPath
const ipfs = require('../utils/ipfs-exec')(repoPath)

// NOTE: Floodsub CLI tests will not be run until
// https://github.com/ipfs/js-ipfs-api/pull/377
// is merged
describe.skip('floodsub', function () {
  this.timeout(30 * 1000)
  let node

  const topic = 'nonscents'
  const message = new Buffer('Some non cents.')

  before((done) => {
    createTempNode(1, (err, _node) => {
      expect(err).to.not.exist
      node = _node
      node.goOnline((err) => {
        expect(err).to.not.exist
        done()
      })
    })
  })

  after((done) => {
    node.goOffline(done)
  })

  describe('api running', () => {
    let httpAPI
    const called = true

    before((done) => {
      httpAPI = new HttpAPI(repoPath)
      httpAPI.start((err) => {
        expect(err).to.not.exist
        done()
      })
    })

    after((done) => {
      httpAPI.stop((err) => {
        expect(err).to.not.exist
        done()
      })
    })

    it('start', () => {
      return ipfs('floodsub', 'start').then((out) => {
        expect(called).to.eql(true)
      })
    })

    it('subscribe', () => {
      return ipfs('floodsub', 'subscribe', topic).then((out) => {
        expect(out).to.have.length.above(0)
      })
    })

    it('publish', () => {
      return ipfs('floodsub', 'publish', topic, message).then((out) => {
        expect(called).to.eql(true)
      })
    })

    it('unsubscribe', () => {
      return ipfs('floodsub', 'unsubscribe', topic).then((out) => {
        expect(called).to.eql(true)
      })
    })
  })
})
