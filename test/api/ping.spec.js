'use strict'

describe('.ping', function () {
  it('ping another peer', function (done) {
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
