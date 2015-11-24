'use strict'

describe('.id', function () {
  it('id', function (done) {
    apiClients['a'].id((err, res) => {
      if (err) throw err
      const id = res
      assert(id.ID)
      assert(id.PublicKey)
      done()
    })
  })
})
