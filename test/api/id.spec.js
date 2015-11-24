'use strict'

describe('.id', function () {
  this.timeout(10000)

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
