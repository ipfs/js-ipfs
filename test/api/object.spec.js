'use strict'

describe('.object', function () {
  const testObject = Buffer(JSON.stringify({Data: 'testdata', Links: []}))
  const testObjectHash = 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD'
  const testPatchObject = Buffer(JSON.stringify({Data: 'new test data'}))
  const testPatchObjectHash = 'QmWJDtdQWQSajQPx1UVAGWKaSGrHVWdjnrNhbooHP7LuF2'

  it('object.put', function (done) {
    apiClients['a'].object.put(testObject, 'json', (err, res) => {
      if (err) throw err
      const obj = res
      assert.equal(obj.Hash, testObjectHash)
      assert.equal(obj.Links.length, 0)
      done()
    })
  })

  it('object.get', function (done) {
    apiClients['a'].object.get(testObjectHash, (err, res) => {
      if (err) {
        throw err
      }
      const obj = res
      assert.equal(obj.Data, 'testdata')
      assert.equal(obj.Links.length, 0)
      done()
    })
  })

  it('object.data', function (done) {
    this.timeout(10000)
    apiClients['a'].object.data(testObjectHash, (err, res) => {
      if (err) throw err

      let buf = ''
      res
        .on('error', err => { throw err })
        .on('data', data => buf += data)
        .on('end', () => {
          assert.equal(buf, 'testdata')
          done()
        })
    })
  })

  it('object.stat', function (done) {
    this.timeout(10000)
    apiClients['a'].object.stat(testObjectHash, (err, res) => {
      if (err) {
        throw err
      }
      assert.deepEqual(res, {
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

  it('object.links', function (done) {
    this.timeout(10000)
    apiClients['a'].object.links(testObjectHash, (err, res) => {
      if (err) {
        throw err
      }

      assert.deepEqual(res, {
        Hash: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
        Links: []
      })
      done()
    })
  })

  it('object.patch', function (done) {
    this.timeout(10000)
    apiClients['a'].object.put(testPatchObject, 'json', (err, res) => {
      if (err) {
        throw err
      }
      apiClients['a'].object.patch(testObjectHash, ['add-link', 'next', testPatchObjectHash], (err, res) => {
        if (err) {
          throw err
        }

        assert.deepEqual(res, {
          Hash: 'QmZFdJ3CQsY4kkyQtjoUo8oAzsEs5BNguxBhp8sjQMpgkd',
          Links: null
        })
        apiClients['a'].object.get(res.Hash, (err, res2) => {
          if (err) {
            throw err
          }
          assert.deepEqual(res2, {
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
