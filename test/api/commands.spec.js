'use strict'

describe('.commands', function () {
  it('lists commands', function (done) {
    apiClients['a'].commands((err, res) => {
      if (err) {
        throw err
      }
      assert(res)
      done()
    })
  })
})
