/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const isNode = require('detect-node')
const IPFS = require('../../src')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'proc' })

const ipfsRef = '/ipfs/QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'

describe('ipns', () => {
  if (!isNode) {
    return
  }

  let node
  let nodeId
  let ipfsd

  before(function (done) {
    this.timeout(40 * 1000)
    df.spawn({
      exec: IPFS
    }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      node = _ipfsd.api

      node.id().then((res) => {
        expect(res.id).to.exist()

        nodeId = res.id
        done()
      })
    })
  })

  after((done) => ipfsd.stop(done))

  it('name publish should publish correctly', (done) => {
    node.name.publish(ipfsRef, false, '5m', '1m', 'self', (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()
      expect(res).to.equal(nodeId)
      done()
    })
  })

  it('name resolve should be performed correctly', (done) => {
    node.name.publish(ipfsRef, false, '5m', '1m', 'self', (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()

      node.name.resolve(nodeId, false, false, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.equal(ipfsRef)
        done()
      })
    })
  })
})
