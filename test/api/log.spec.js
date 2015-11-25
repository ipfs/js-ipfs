'use strict'

describe('.log', () => {
  it('.log.tail', done => {
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
