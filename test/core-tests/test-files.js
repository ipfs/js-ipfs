/* eslint-env mocha */

const bl = require('bl')
const expect = require('chai').expect

const IPFS = require('../../src/core')

describe('files', () => {
  var ipfs

  before((done) => {
    ipfs = new IPFS()
    ipfs.load(done)
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
