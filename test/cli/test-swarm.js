/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const HttpAPI = require('../../src/http-api')
const createTempNode = require('../utils/temp-node')
const repoPath = require('./index').repoPath
const ipfs = require('../utils/ipfs-exec')(repoPath)

describe('swarm', function () {
  this.timeout(30 * 1000)
  let node
  let nodeAddr

  before((done) => {
    createTempNode(1, (err, _node) => {
      expect(err).to.not.exist
      node = _node
      node.goOnline((err) => {
        expect(err).to.not.exist
        node.id((err, identity) => {
          expect(err).to.not.exist
          nodeAddr = identity.addresses[0]
          done()
        })
      })
    })
  })

  after((done) => {
    node.goOffline(done)
  })

  describe('api running', () => {
    let httpAPI

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

    it('connect', () => {
      return ipfs('swarm', 'connect', nodeAddr).then((out) => {
        expect(out).to.be.eql(
          `connect ${nodeAddr} success`
        )
      })
    })

    it('peers', () => {
      return ipfs('swarm peers').then((out) => {
        expect(out).to.be.eql(nodeAddr)
      })
    })

    it('addrs', () => {
      return ipfs('swarm addrs').then((out) => {
        expect(out).to.have.length.above(0)
      })
    })

    it('addrs local', () => {
      return ipfs('swarm addrs local').then((out) => {
        expect(out).to.have.length.above(0)
      })
    })
  })
})
