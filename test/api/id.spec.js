'use strict'

describe('.id', () => {
  it('id', done => {
    apiClients['a'].id((err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.a.property('ID')
      expect(res).to.have.a.property('PublicKey')
      done()
    })
  })
})
