/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const series = require('async/series')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const CID = require('cids')
const IPFSApi = require('../src')
const f = require('./utils/factory')

let ipfsd
let ipfs

describe('.dag', function () {
  this.timeout(20 * 1000)
  before(function (done) {
    series([
      (cb) => f.spawn({ initOptions: { bits: 1024 } }, (err, _ipfsd) => {
        expect(err).to.not.exist()
        ipfsd = _ipfsd
        ipfs = IPFSApi(_ipfsd.apiAddr)
        cb()
      })
    ], done)
  })

  after((done) => {
    if (!ipfsd) return done()
    ipfsd.stop(done)
  })

  it('should be able to put and get a DAG node with format dag-pb', (done) => {
    const data = Buffer.from('some data')
    DAGNode.create(data, (err, node) => {
      expect(err).to.not.exist()
      ipfs.dag.put(node, {format: 'dag-pb', hashAlg: 'sha2-256'}, (err, cid) => {
        expect(err).to.not.exist()
        cid = cid.toV0()
        expect(cid.codec).to.equal('dag-pb')
        cid = cid.toBaseEncodedString('base58btc')
        // expect(cid).to.equal('bafybeig3t3eugdchignsgkou3ly2mmy4ic4gtfor7inftnqn3yq4ws3a5u')
        expect(cid).to.equal('Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr')
        ipfs.dag.get(cid, (err, result) => {
          expect(err).to.not.exist()
          expect(result.value.data).to.deep.equal(data)
          done()
        })
      })
    })
  })

  it('should be able to put and get a DAG node with format dag-cbor', (done) => {
    const cbor = {foo: 'dag-cbor-bar'}
    ipfs.dag.put(cbor, {format: 'dag-cbor', hashAlg: 'sha2-256'}, (err, cid) => {
      expect(err).to.not.exist()
      expect(cid.codec).to.equal('dag-cbor')
      cid = cid.toBaseEncodedString('base32')
      expect(cid).to.equal('bafyreic6f672hnponukaacmk2mmt7vs324zkagvu4hcww6yba6kby25zce')
      ipfs.dag.get(cid, (err, result) => {
        expect(err).to.not.exist()
        expect(result.value).to.deep.equal(cbor)
        done()
      })
    })
  })

  it('should callback with error when missing DAG resolver for raw multicodec', (done) => {
    ipfs.dag.put(Buffer.from([0, 1, 2, 3]), {
      // CIDv1 with multicodec = raw
      cid: new CID('bafkreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy')
    }, (err, cid) => {
      expect(err).to.not.exist()

      ipfs.dag.get(cid, (err, result) => {
        expect(result).to.not.exist()
        expect(err.message).to.equal('ipfs-api is missing DAG resolver for "raw" multicodec')
        done()
      })
    })
  })
})
