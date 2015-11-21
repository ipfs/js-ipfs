'use strict'

describe('.ping', function () {
  it('ping another peer', function (done) {
    if (isNode) {
      // Ping returns streaming json in the browser
      // which breaks the parser atm. See https://github.com/ipfs/node-ipfs-api/issues/86
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
