'use strict'

describe('.log', () => {
  it('.log.tail', done => {
    const req = apiClients['a'].log.tail((err, res) => {
      expect(err).to.not.exist

      expect(req).to.exist

      res.once('data', obj => {
        expect(obj).to.be.an('object')
        done()
      })
    })
  })
})
