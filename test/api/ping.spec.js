'use strict'

describe('.ping', () => {
  it('ping another peer', done => {
    // TODO remove this when https://github.com/ipfs/js-ipfs-api/issues/135 is resolved
    if (!isNode) {
      return done()
    }

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
