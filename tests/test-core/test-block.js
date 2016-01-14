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
      const eq = fs.readFileSync(process.cwd() + '/tests/repo-example/blocks/12207028/122070286b9afa6620a66f715c7020d68af3d10e1a497971629c07606bfdb812303d.data').equals(block)
      expect(eq).to.equal(true)
      done()
    })
  })
  it.skip('put', done => {
    done()
  })
  it.skip('put', done => {
    done()
  })
  it.skip('stat', done => {
    done()
  })
})
