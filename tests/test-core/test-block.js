/* eslint-env mocha */

const expect = require('chai').expect
const base58 = require('bs58')
const fs = require('fs')
const IPFS = require('../../src/core')
const Block = require('ipfs-blocks').Block

const isNode = !global.window

const fileA = isNode
  ? fs.readFileSync(process.cwd() + '/tests/repo-example/blocks/12207028/122070286b9afa6620a66f715c7020d68af3d10e1a497971629c07606bfdb812303d.data')
  : require('buffer!./../repo-example/blocks/12207028/122070286b9afa6620a66f715c7020d68af3d10e1a497971629c07606bfdb812303d.data')

// TODO use arrow funtions again when https://github.com/webpack/webpack/issues/1944 is fixed
describe('block', function () {
  var ipfs

  before((done) => {
    ipfs = new IPFS()
    ipfs.load(done)
  })

  it('get', function (done) {
    const b58mh = 'QmVtU7ths96fMgZ8YSZAbKghyieq7AjxNdcqyVzxTt3qVe'
    const mh = new Buffer(base58.decode(b58mh))
    ipfs.block.get(mh, (err, block) => {
      expect(err).to.not.exist
      const eq = fileA.equals(block.data)
      expect(eq).to.equal(true)
      done()
    })
  })

  it('put', (done) => {
    var b = new Block('random data')
    ipfs.block.put(b, function (err) {
      expect(err).to.not.exist
      ipfs.block.get(b.key, function (err, block) {
        expect(err).to.not.exist
        expect(b.data.equals(block.data)).to.equal(true)
        expect(b.key.equals(block.key)).to.equal(true)
        done()
      })
    })
  })

  it('rm', (done) => {
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

  it('stat', function (done) {
    const mh = new Buffer(base58
      .decode('QmVtU7ths96fMgZ8YSZAbKghyieq7AjxNdcqyVzxTt3qVe'))
    ipfs.block.stat(mh, (err, stats) => {
      expect(err).to.not.exist
      expect(stats.Key.equals(mh)).to.equal(true)
      expect(stats.Size).to.equal(309)
      done()
    })
  })
})
