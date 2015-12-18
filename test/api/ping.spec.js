'use strict'

describe('.ping', () => {
  it('ping another peer', done => {
    apiClients['b'].id((err, id) => {
      expect(err).to.not.exist

      apiClients['a'].ping(id.ID, (err, res) => {
        expect(err).to.not.exist
        expect(res).to.have.a.property('Success')
        done()
      })
    })
  })
})
