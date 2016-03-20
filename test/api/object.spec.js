/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect

describe('.object', () => {
  const testObject = Buffer(JSON.stringify({Data: 'testdata', Links: []}))
  const testObjectHash = 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD'
  const testPatchObject = Buffer(JSON.stringify({Data: 'new test data'}))
  const testPatchObjectHash = 'QmWJDtdQWQSajQPx1UVAGWKaSGrHVWdjnrNhbooHP7LuF2'

  it('object.put', (done) => {
    apiClients.a.object.put(testObject, 'json', (err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.a.property('Hash', testObjectHash)
      expect(res.Links).to.be.empty
      done()
    })
  })

  it('object.get', (done) => {
    apiClients.a.object.get(testObjectHash, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.a.property('Data', 'testdata')
      expect(res.Links).to.be.empty
      done()
    })
  })

  it('object.data', (done) => {
    apiClients.a.object.data(testObjectHash, (err, res) => {
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
    apiClients.a.object.stat(testObjectHash, (err, res) => {
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
    apiClients.a.object.links(testObjectHash, (err, res) => {
      expect(err).to.not.exist

      expect(res).to.be.eql({
        Hash: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
        Links: []
      })
      done()
    })
  })

  describe('object.patch', () => {
    before((done) => {
      apiClients.a.object.put(testPatchObject, 'json', (err, res) => {
        expect(err).to.not.exist
        done()
      })
    })

    it('.addLink', (done) => {
      apiClients.a.object.patch
        .addLink(testObjectHash, 'next', testPatchObjectHash, (err, res) => {
          expect(err).to.not.exist
          expect(res).to.be.eql({
            Hash: 'QmZFdJ3CQsY4kkyQtjoUo8oAzsEs5BNguxBhp8sjQMpgkd',
            Links: null
          })
          apiClients.a.object.get(res.Hash, (err, res) => {
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
      apiClients.a.object.patch
        .rmLink('QmZFdJ3CQsY4kkyQtjoUo8oAzsEs5BNguxBhp8sjQMpgkd', 'next', (err, res) => {
          expect(err).to.not.exist
          expect(res).to.be.eql({
            Hash: testObjectHash,
            Links: null
          })
          apiClients.a.object.get(res.Hash, (err, res) => {
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
      apiClients.a.object.patch
        .appendData(testObjectHash, new Buffer(' hello'), (err, res) => {
          expect(err).to.not.exist
          expect(res).to.be.eql({
            Hash: 'Qmcjhr2QztQxCAoEf8tJPTGTVkTsUrTQ36JurH14DNYNsc',
            Links: null
          })
          apiClients.a.object.get(res.Hash, (err, res) => {
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
      apiClients.a.object.patch
        .setData(testObjectHash, new Buffer('hello world'), (err, res) => {
          expect(err).to.not.exist
          expect(res).to.be.eql({
            Hash: 'QmU1Sq1B7RPQD2XcQNLB58qJUyJffVJqihcxmmN1STPMxf',
            Links: null
          })
          apiClients.a.object.get(res.Hash, (err, res) => {
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
    apiClients.a.object.new('unixfs-dir', (err, res) => {
      expect(err).to.not.exist
      expect(res).to.deep.equal({
        Hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
        Links: null
      })
      done()
    })
  })

  describe('promise', () => {
    it('object.put', () => {
      return apiClients.a.object.put(testObject, 'json')
        .then((res) => {
          expect(res).to.have.a.property('Hash', testObjectHash)
          expect(res.Links).to.be.empty
        })
    })

    it('object.get', () => {
      return apiClients.a.object.get(testObjectHash)
        .then((res) => {
          expect(res).to.have.a.property('Data', 'testdata')
          expect(res.Links).to.be.empty
        })
    })

    it('object.data', (done) => {
      return apiClients.a.object.data(testObjectHash)
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
      return apiClients.a.object.stat(testObjectHash)
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
      return apiClients.a.object.links(testObjectHash)
        .then((res) => {
          expect(res).to.be.eql({
            Hash: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
            Links: []
          })
        })
    })

    it('object.new', () => {
      return apiClients.a.object.new('unixfs-dir')
        .then((res) => {
          expect(res).to.deep.equal({
            Hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
            Links: null
          })
        })
    })
  })
})
