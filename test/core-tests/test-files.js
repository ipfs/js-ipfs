/* eslint-env mocha */
'use strict'

const bl = require('bl')
const expect = require('chai').expect
const streamifier = require('streamifier')
const bs58 = require('bs58')

const IPFS = require('../../src/core')

describe('files', () => {
  var ipfs

  before((done) => {
    ipfs = new IPFS()
    ipfs.load(done)
  })

  it('add', (done) => {
    const buffered = new Buffer('some data')
    const r = streamifier.createReadStream(buffered)
    var arr = []
    const filePair = {path: 'data.txt', stream: r}
    arr.push(filePair)
    ipfs.files.add(arr, (err,res) => {
      expect(err).to.not.exist
      expect(res[0].path).to.equal('data.txt')
      expect(res[0].size).to.equal(17)
      expect(bs58.encode(res[0].multihash).toString()).to.equal('QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS')
      done()
    })
  })

  it('cat', (done) => {
    const hash = 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
    ipfs.files.cat(hash, (err, res) => {
      expect(err).to.not.exist
      res.on('file', (data) => {
        data.stream.pipe(bl((err, bldata) => {
          expect(err).to.not.exist
          expect(bldata.toString()).to.equal('hello world\n')
          done()
        }))
      })
    })
  })

  it('get', (done) => {
    // TODO create non-trival get test
    const hash = 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
    ipfs.files.get(hash, (err, res) => {
      expect(err).to.not.exist
      res.on('file', (data) => {
        data.stream.pipe(bl((err, bldata) => {
          expect(err).to.not.exist
          expect(bldata.toString()).to.equal('hello world\n')
          done()
        }))
      })
    })
  })
})
