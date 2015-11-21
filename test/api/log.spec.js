'use strict'

describe('.log', function () {
  it('.log.tail', function (done) {
    this.timeout(20000)

    apiClients['a'].log.tail((err, res) => {
      if (err) {
        throw err
      }
      res.once('data', obj => {
        assert(obj)
        assert.equal(typeof obj, 'object')
        done()
      })
    })
  })
})
