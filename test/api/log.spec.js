'use strict'

describe('.log', () => {
  it('.log.tail', done => {
    apiClients['a'].log.tail((err, res) => {
      expect(err).to.not.exist

      res.once('data', obj => {
        expect(obj).to.be.an('object')
        done()
      })
    })
  })
})
