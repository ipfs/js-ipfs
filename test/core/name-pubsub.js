/* eslint max-nested-callbacks: ["error", 6] */
/* eslint-env mocha */
'use strict'

const hat = require('hat')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const parallel = require('async/parallel')

const isNode = require('detect-node')
const IPFS = require('../../src')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'proc' })

const ipfsRef = '/ipfs/QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

describe('name-pubsub', function () {
  if (!isNode) {
    return
  }

  let nodes
  let nodeA
  let nodeB
  let idA

  const createNode = (callback) => {
    df.spawn({
      exec: IPFS,
      args: [`--pass ${hat()}`, '--enable-namesys-pubsub'],
      config: {
        Bootstrap: [],
        Discovery: {
          MDNS: {
            Enabled: false
          },
          webRTCStar: {
            Enabled: false
          }
        }
      }
    }, callback)
  }

  before(function (done) {
    this.timeout(40 * 1000)

    parallel([
      (cb) => createNode(cb),
      (cb) => createNode(cb)
    ], (err, _nodes) => {
      expect(err).to.not.exist()

      nodes = _nodes
      nodeA = _nodes[0].api
      nodeB = _nodes[1].api

      parallel([
        (cb) => nodeA.id(cb),
        (cb) => nodeB.id(cb)
      ], (err, ids) => {
        expect(err).to.not.exist()

        idA = ids[0]
        nodeA.swarm.connect(ids[1].addresses[0], done)
      })
    })
  })

  after((done) => parallel(nodes.map((node) => (cb) => node.stop(cb)), done))

  it('should publish and then resolve correctly', function (done) {
    this.timeout(80 * 1000)

    nodeB.name.resolve(idA.id, (err) => {
      expect(err).to.exist()

      nodeA.name.publish(ipfsRef, { resolve: false }, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()

        nodeB.name.resolve(idA.id, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          expect(res.path).to.equal(ipfsRef)
          done()
        })
      })
    })
  })
})
