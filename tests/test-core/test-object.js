/* globals describe, before, it */

'use strict'

const expect = require('chai').expect
const IPFS = require('../../src/ipfs-core')
const bs58 = require('bs58')
const mDAG = require('ipfs-merkle-dag')
const DAGNode = mDAG.DAGNode
const DAGLink = mDAG.DAGLink

// TODO use arrow funtions again when https://github.com/webpack/webpack/issues/1944 is fixed
describe('object', function () {
  var ipfs

  before(function (done) {
    ipfs = new IPFS()
    done()
  })

  it('new', function (done) {
    ipfs.object.new(function (err, obj) {
      expect(err).to.not.exist
      expect(obj).to.have.property('Size')
      expect(obj.Size).to.equal(0)
      expect(obj).to.have.property('Name')
      expect(obj.Name).to.equal('')
      expect(obj).to.have.property('Hash')
      expect(bs58.encode(obj.Hash).toString())
         .to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
      expect(obj.Size).to.equal(0)
      done()
    })
  })

  it('patch append-data', function (done) {
    const mh = new Buffer(bs58.decode('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'))

    ipfs.object.patch.appendData(mh, new Buffer('data data'), function (err, multihash) {
      expect(err).to.not.exist
      expect(mh).to.not.deep.equal(multihash)
      done()
    })
  })

  it('patch add-link', function (done) {
    const mh = new Buffer(bs58.decode('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'))

    ipfs.object.patch.addLink(mh, new DAGLink('prev', 0, mh), function (err, multihash) {
      expect(err).to.not.exist
      expect(mh).to.not.deep.equal(multihash)
      done()
    })
  })

  it('patch rm-link', function (done) {
    const rmmh = new Buffer(bs58.decode('QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V'))
    const mh = new Buffer(bs58.decode('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'))

    ipfs.object.patch.rmLink(mh, rmmh, function (err, multihash) {
      expect(err).to.not.exist
      expect(mh).to.not.deep.equal(multihash)
      done()
    })
  })

  it('patch set-data', function (done) {
    const mh = new Buffer(bs58.decode('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'))

    ipfs.object.patch.setData(mh, new Buffer('data data data'), function (err, multihash) {
      expect(err).to.not.exist
      expect(mh).to.not.deep.equal(multihash)
      done()
    })
  })

  it('data', function (done) {
    const mh = new Buffer(bs58.decode('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'))
    ipfs.object.data(mh, function (err, data) {
      expect(err).to.not.exist
      expect(data).to.deep.equal(new Buffer('\u0008\u0001'))
      done()
    })
  })

  it('links', function (done) {
    const mh = new Buffer(bs58.decode('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'))
    ipfs.object.links(mh, function (err, links) {
      expect(err).to.not.exist
      expect(links.length).to.equal(6)
      done()
    })
  })

  it('get', function (done) {
    const mh = new Buffer(bs58.decode('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'))
    ipfs.object.get(mh, function (err, obj) {
      expect(err).to.not.exist
      expect(obj.size()).to.equal(0)
      expect(obj).to.have.property('data')
      expect(obj).to.have.property('links')
      done()
    })
  })

  it('put', function (done) {
    const node = new DAGNode(new Buffer('Hello, is it me you are looking for'))
    ipfs.object.put(node, function (err) {
      expect(err).to.not.exist
      done()
    })
  })

  it('stat', function (done) {
    const mh = new Buffer(bs58.decode('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'))
    ipfs.object.stat(mh, function (err, stats) {
      expect(err).to.not.exist

      var expected = {
        NumLinks: 6,
        BlockSize: 309,
        LinksSize: 6067,
        DataSize: 2,
        CumulativeSize: ''
      }
      expect(stats).to.deep.equal(expected)
      done()
    })
  })
})
