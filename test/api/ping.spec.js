'use strict'

describe('.ping', () => {
  it('ping another peer', done => {
    // TODO remove this when https://github.com/ipfs/js-ipfs-api/issues/135 is resolved
    if (!isNode) {
      return done()
    }

    apiClients['b'].id((err, id) => {
      if (err) {
        throw err
      }

      apiClients['a'].ping(id.ID, (err, res) => {
        if (err) {
          throw err
        }

        assert(res)
        assert(res.Success)
        done()
      })
    })
  })
})
