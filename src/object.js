/* eslint-env mocha */

'use strict'

const expect = require('chai').expect

module.exports = (common) => {
  let ipfs

  before((done) => {
    common.setup((err, _ipfs) => {
      expect(err).to.not.exist
      ipfs = _ipfs
      done()
    })
  })

  after((done) => {
    common.teardown(done)
  })

  describe('.object', () => {
    const testObject = Buffer(JSON.stringify({Data: 'testdata', Links: []}))
    const testObjectHash = 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD'
    const testPatchObject = Buffer(JSON.stringify({Data: 'new test data'}))
    const testPatchObjectHash = 'QmWJDtdQWQSajQPx1UVAGWKaSGrHVWdjnrNhbooHP7LuF2'

    it('object.put', (done) => {
      ipfs.object.put(testObject, 'json', (err, res) => {
        expect(err).to.not.exist
        expect(res).to.have.a.property('Hash', testObjectHash)
        expect(res.Links).to.be.empty
        done()
      })
    })

    it('object.get', (done) => {
      ipfs.object.get(testObjectHash, (err, res) => {
        expect(err).to.not.exist
        expect(res).to.have.a.property('Data', 'testdata')
        expect(res.Links).to.be.empty
        done()
      })
    })

    it('object.data', (done) => {
      ipfs.object.data(testObjectHash, (err, res) => {
        expect(err).to.not.exist

        let buf = ''
        res
          .on('error', (err) => {
            expect(err).to.not.exist
          })
          .on('data', (data) => {
            buf += data
          })
          .on('end', () => {
            expect(buf).to.equal('testdata')
            done()
          })
      })
    })

    it('object.stat', (done) => {
      ipfs.object.stat(testObjectHash, (err, res) => {
        expect(err).to.not.exist
        expect(res).to.be.eql({
          Hash: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
          NumLinks: 0,
          BlockSize: 10,
          LinksSize: 2,
          DataSize: 8,
          CumulativeSize: 10
        })
        done()
      })
    })

    it('object.links', (done) => {
      ipfs.object.links(testObjectHash, (err, res) => {
        expect(err).to.not.exist

        expect(res).to.be.eql({
          Hash: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD'
        })
        done()
      })
    })

    describe('object.patch', () => {
      before((done) => {
        ipfs.object.put(testPatchObject, 'json', (err, res) => {
          expect(err).to.not.exist
          done()
        })
      })

      it('.addLink', (done) => {
        ipfs.object.patch
          .addLink(testObjectHash, 'next', testPatchObjectHash, (err, res) => {
            expect(err).to.not.exist
            expect(res).to.be.eql({
              Hash: 'QmZFdJ3CQsY4kkyQtjoUo8oAzsEs5BNguxBhp8sjQMpgkd'
            })
            ipfs.object.get(res.Hash, (err, res) => {
              expect(err).to.not.exist
              expect(res).to.be.eql({
                Data: 'testdata',
                Links: [{
                  Name: 'next',
                  Hash: 'QmWJDtdQWQSajQPx1UVAGWKaSGrHVWdjnrNhbooHP7LuF2',
                  Size: 15
                }]
              })
              done()
            })
          })
      })

      it('.rmLink', (done) => {
        ipfs.object.patch
          .rmLink('QmZFdJ3CQsY4kkyQtjoUo8oAzsEs5BNguxBhp8sjQMpgkd', 'next', (err, res) => {
            expect(err).to.not.exist
            expect(res).to.be.eql({
              Hash: testObjectHash
            })
            ipfs.object.get(res.Hash, (err, res) => {
              expect(err).to.not.exist
              expect(res).to.be.eql({
                Data: 'testdata',
                Links: []
              })
              done()
            })
          })
      })

      it('.appendData', (done) => {
        ipfs.object.patch
          .appendData(testObjectHash, new Buffer(' hello'), (err, res) => {
            expect(err).to.not.exist
            expect(res).to.be.eql({
              Hash: 'Qmcjhr2QztQxCAoEf8tJPTGTVkTsUrTQ36JurH14DNYNsc'
            })
            ipfs.object.get(res.Hash, (err, res) => {
              expect(err).to.not.exist
              expect(res).to.be.eql({
                Data: 'testdata hello',
                Links: []
              })
              done()
            })
          })
      })
      it('.setData', (done) => {
        ipfs.object.patch
          .setData(testObjectHash, new Buffer('hello world'), (err, res) => {
            expect(err).to.not.exist
            expect(res).to.be.eql({
              Hash: 'QmU1Sq1B7RPQD2XcQNLB58qJUyJffVJqihcxmmN1STPMxf'
            })
            ipfs.object.get(res.Hash, (err, res) => {
              expect(err).to.not.exist
              expect(res).to.be.eql({
                Data: 'hello world',
                Links: []
              })
              done()
            })
          })
      })
    })

    it('object.new', (done) => {
      ipfs.object.new('unixfs-dir', (err, res) => {
        expect(err).to.not.exist
        expect(res).to.deep.equal({
          Hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
        })
        done()
      })
    })

    describe('promise', () => {
      it('object.put', () => {
        return ipfs.object.put(testObject, 'json')
          .then((res) => {
            expect(res).to.have.a.property('Hash', testObjectHash)
            expect(res.Links).to.be.empty
          })
      })

      it('object.get', () => {
        return ipfs.object.get(testObjectHash)
          .then((res) => {
            expect(res).to.have.a.property('Data', 'testdata')
            expect(res.Links).to.be.empty
          })
      })

      it('object.data', (done) => {
        return ipfs.object.data(testObjectHash)
          .then((res) => {
            let buf = ''
            res
              .on('error', (err) => {
                throw err
              })
              .on('data', (data) => {
                buf += data
              })
              .on('end', () => {
                expect(buf).to.equal('testdata')
                done()
              })
          })
      })

      it('object.stat', () => {
        return ipfs.object.stat(testObjectHash)
          .then((res) => {
            expect(res).to.be.eql({
              Hash: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
              NumLinks: 0,
              BlockSize: 10,
              LinksSize: 2,
              DataSize: 8,
              CumulativeSize: 10
            })
          })
      })

      it('object.links', () => {
        return ipfs.object.links(testObjectHash)
          .then((res) => {
            expect(res).to.be.eql({
              Hash: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD'
            })
          })
      })

      it('object.new', () => {
        return ipfs.object.new('unixfs-dir')
          .then((res) => {
            expect(res).to.deep.equal({
              Hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
            })
          })
      })
    })
  })
}
