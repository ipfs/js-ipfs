'use strict'

describe('.object', () => {
  const testObject = Buffer(JSON.stringify({Data: 'testdata', Links: []}))
  const testObjectHash = 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD'
  const testPatchObject = Buffer(JSON.stringify({Data: 'new test data'}))
  const testPatchObjectHash = 'QmWJDtdQWQSajQPx1UVAGWKaSGrHVWdjnrNhbooHP7LuF2'

  it('object.put', done => {
    apiClients['a'].object.put(testObject, 'json', (err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.a.property('Hash', testObjectHash)
      expect(res.Links).to.be.empty
      done()
    })
  })

  it('object.get', done => {
    apiClients['a'].object.get(testObjectHash, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.a.property('Data', 'testdata')
      expect(res.Links).to.be.empty
      done()
    })
  })

  it('object.data', done => {
    apiClients['a'].object.data(testObjectHash, (err, res) => {
      expect(err).to.not.exist

      let buf = ''
      res
        .on('error', err => { throw err })
        .on('data', data => buf += data)
        .on('end', () => {
          expect(buf).to.equal('testdata')
          done()
        })
    })
  })

  it('object.stat', done => {
    apiClients['a'].object.stat(testObjectHash, (err, res) => {
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

  it('object.links', done => {
    apiClients['a'].object.links(testObjectHash, (err, res) => {
      expect(err).to.not.exist

      expect(res).to.be.eql({
        Hash: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
        Links: []
      })
      done()
    })
  })

  it('object.patch', done => {
    apiClients['a'].object.put(testPatchObject, 'json', (err, res) => {
      expect(err).to.not.exist
      apiClients['a'].object.patch(testObjectHash, ['add-link', 'next', testPatchObjectHash], (err, res) => {
        expect(err).to.not.exist
        expect(res).to.be.eql({
          Hash: 'QmZFdJ3CQsY4kkyQtjoUo8oAzsEs5BNguxBhp8sjQMpgkd',
          Links: null
        })
        apiClients['a'].object.get(res.Hash, (err, res2) => {
          expect(err).to.not.exist
          expect(res2).to.be.eql({
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
  })
})
