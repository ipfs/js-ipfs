/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const HttpAPI = require('../../src/http-api')
const createTempNode = require('../utils/temp-node')
const repoPath = require('./index').repoPath
const ipfs = require('../utils/ipfs-exec')(repoPath)

// This depends on:
// ipfs/interface-ipfs-core.git#5c7df414a8f627f8adb50a52ef8d2b629381285f
// ipfs/js-ipfs-api.git#01044a1f59fb866e4e08b06aae4e74d968615931
describe.only('pubsub', function () {
  this.timeout(30 * 1000)
  let node

  const topicA = 'nonscentsA'
  const topicB = 'nonscentsB'
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

    it('subscribe', () => {
      return ipfs('pubsub', 'subscribe', topicA).then((out) => {
        expect(out).to.have.length.above(0)
      })
    })

    it('subscribe alias', () => {
      return ipfs('pubsub', 'sub', topicB).then((out) => {
        expect(out).to.have.length.above(0)
      })
    })

    it('publish', () => {
      return ipfs('pubsub', 'publish', topicA, message).then((out) => {
        expect(called).to.eql(true)
      })
    })

    it('ls', () => {
      return ipfs('pubsub', 'ls').then((out) => {
        expect(out).to.have.length.above(0)
      })
    })

    it('peers', () => {
      return ipfs('pubsub', 'peers', topicA).then((out) => {
        expect(out).to.be.eql('[]')
      })
    })
  })
})
















