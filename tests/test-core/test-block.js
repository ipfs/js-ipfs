/* globals describe, it */

'use strict'

const expect = require('chai').expect
const base58 = require('bs58')
const fs = require('fs')
const IPFS = require('../../src/ipfs-core')

describe('block', () => {
  it('get', done => {
    const ipfs = new IPFS()
    const b58mh = 'QmVtU7ths96fMgZ8YSZAbKghyieq7AjxNdcqyVzxTt3qVe'
    const mh = new Buffer(base58.decode(b58mh))
    ipfs.block.get(mh, (err, block) => {
      expect(err).to.not.exist
      const eq = fs.readFileSync(process.cwd() + '/tests/repo-example/blocks/12207028/122070286b9afa6620a66f715c7020d68af3d10e1a497971629c07606bfdb812303d.data').equals(block.data)
      expect(eq).to.equal(true)
      done()
    })
  })
  it.skip('put', done => {
    done()
  })

  it('rm', done => {
    var b = new Block('I will not last long enough')
    ipfs.block.put(b, function (err) {
      expect(err).to.not.exist
      ipfs.block.get(b.key, function (err, block) {
        expect(err).to.not.exist
        ipfs.block.del(b.key, function (err) {
          expect(err).to.not.exist
          ipfs.block.get(b.key, function (err, block) {
            expect(err).to.exist
            done()
          })
        })
      })
    })
  })

  it('stat', done => {
    const mh = new Buffer(base58
        .decode('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'))
    ipfs.block.stat(mh, (err, stats) => {
      expect(err).to.not.exist
      expect(stats.Key.equals(mh)).to.equal(true)
      expect(stats.Size).to.equal(309)
      done()
    })
  })
})
