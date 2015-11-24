'use strict'

describe('.log', function () {
  this.timeout(60000)
  it('.log.tail', function (done) {
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
