/* eslint-env mocha */

const expect = require('chai').expect
const IPFS = require('../../src/core')
const bs58 = require('bs58')
const mDAG = require('ipfs-merkle-dag')
const DAGNode = mDAG.DAGNode
const DAGLink = mDAG.DAGLink

// TODO use arrow funtions again when https://github.com/webpack/webpack/issues/1944 is fixed
describe('object', () => {
  var ipfs

  before((done) => {
    ipfs = new IPFS()
    ipfs.load(done)
  })

  it('new', (done) => {
    ipfs.object.new((err, obj) => {
      expect(err).to.not.exist
      expect(obj).to.have.property('Size', 0)
      expect(obj).to.have.property('Name', '')
      expect(obj).to.have.property('Hash')
      expect(bs58.encode(obj.Hash).toString())
         .to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
      expect(obj.Size).to.equal(0)
      done()
    })
  })

  it('patch append-data', (done) => {
    const mh = new Buffer(bs58.decode('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'))

    ipfs.object.patch.appendData(mh, new Buffer('data data'), (err, multihash) => {
      expect(err).to.not.exist
      expect(mh).to.not.deep.equal(multihash)
      done()
    })
  })

  it('patch add-link', (done) => {
    const mh = new Buffer(bs58.decode('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'))

    ipfs.object.patch.addLink(mh, new DAGLink('prev', 0, mh), (err, multihash) => {
      expect(err).to.not.exist
      expect(mh).to.not.deep.equal(multihash)
      done()
    })
  })

  it('patch rm-link', (done) => {
    const rmmh = new Buffer(bs58.decode('QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V'))
    const mh = new Buffer(bs58.decode('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'))

    ipfs.object.patch.rmLink(mh, rmmh, (err, multihash) => {
      expect(err).to.not.exist
      expect(mh).to.not.deep.equal(multihash)
      done()
    })
  })

  it('patch set-data', (done) => {
    const mh = new Buffer(bs58.decode('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'))

    ipfs.object.patch.setData(mh, new Buffer('data data data'), (err, multihash) => {
      expect(err).to.not.exist
      expect(mh).to.not.deep.equal(multihash)
      done()
    })
  })

  it('data', (done) => {
    const mh = new Buffer(bs58.decode('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'))
    ipfs.object.data(mh, (err, data) => {
      expect(err).to.not.exist
      expect(data).to.deep.equal(new Buffer('\u0008\u0001'))
      done()
    })
  })

  it('links', (done) => {
    const mh = new Buffer(bs58.decode('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'))
    ipfs.object.links(mh, (err, links) => {
      expect(err).to.not.exist
      expect(links.length).to.equal(6)
      done()
    })
  })

  it('get', (done) => {
    const mh = new Buffer(bs58.decode('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'))
    ipfs.object.get(mh, (err, obj) => {
      expect(err).to.not.exist
      expect(obj.size()).to.equal(0)
      expect(obj).to.have.property('data')
      expect(obj).to.have.property('links')
      done()
    })
  })

  it('put', (done) => {
    const node = new DAGNode(new Buffer('Hello, is it me you are looking for'))
    ipfs.object.put(node, (err) => {
      expect(err).to.not.exist
      done()
    })
  })

  it('stat', (done) => {
    const mh = new Buffer(bs58.decode('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'))
    ipfs.object.stat(mh, (err, stats) => {
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
