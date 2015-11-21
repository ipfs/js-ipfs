'use strict'

describe('.refs', function () {
  const folder = 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg'

  it('refs', function (done) {
    if (!isNode) {
      return done()
    }

    this.timeout(10000)
    apiClients['a'].refs(folder, {'format': '<src> <dst> <linkname>'}, (err, objs) => {
      if (err) {
        throw err
      }

      const result = [{
        Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmcUYKmQxmTcFom4R4UZP7FWeQzgJkwcFn51XrvsMy7PE9 add.js',
        Err: ''
      }, {
        Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmNeHxDfQfjVFyYj2iruvysLH9zpp78v3cu1s3BZq1j5hY cat.js',
        Err: ''
      }, {
        Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmTYFLz5vsdMpq4XXw1a1pSxujJc9Z5V3Aw1Qg64d849Zy files',
        Err: ''
      }, {
        Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmU7wetVaAqc3Meurif9hcYBHGvQmL5QdpPJYBoZizyTNL ipfs-add.js',
        Err: ''
      }, {
        Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmctZfSuegbi2TMFY2y3VQjxsH5JbRBu7XmiLfHNvshhio ls.js',
        Err: ''
      }, {
        Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmTDH2RXGn8XyDAo9YyfbZAUXwL1FCr44YJCN9HBZmL9Gj test-folder',
        Err: ''
      }, {
        Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmbkMNB6rwfYAxRvnG9CWJ6cKKHEdq2ZKTozyF5FQ7H8Rs version.js',
        Err: ''
      }]
      assert.deepEqual(objs, result)

      done()
    })
  })
})
