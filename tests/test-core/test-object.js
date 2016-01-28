/* globals describe, before, it */

'use strict'

const expect = require('chai').expect
const IPFS = require('../../src/ipfs-core')
const bs58 = require('bs58')
// const Block = require('ipfs-merkle-dag').Block

// TODO use arrow funtions again when https://github.com/webpack/webpack/issues/1944 is fixed
describe('object', function () {
  var ipfs

  before(function (done) {
    ipfs = new IPFS()
    done()
  })

  it('create', function (done) {
    ipfs.object.create(function (err, obj) {
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

  it.skip('patch append-data', function (done) {

  })

  it.skip('patch add-link', function (done) {

  })

  it.skip('patch rm-link', function (done) {

  })

  it.skip('patch set-data', function (done) {

  })

  it.skip('patch append-data go-ipfs mDAG obj', function (done) {

  })

  it.skip('patch add-link go-ipfs mDAG obj', function (done) {

  })

  it.skip('patch rm-link go-ipfs mDAG obj', function (done) {

  })

  it.skip('patch set-data go-ipfs mDAG obj', function (done) {

  })

  it.skip('data', function (done) {

  })

  it.skip('links', function (done) {

  })

  it.skip('get', function (done) {

  })

  it.skip('get cycle', function (done) {
    // 1. get a go-ipfs marshaled DAG Node
    // 2. store it and fetch it again
    // 3. check if still matches (ipfs-merkle-dag should not mangle it)
  })

  it.skip('put', function (done) {

  })

  it.skip('stat', function (done) {

  })
})
