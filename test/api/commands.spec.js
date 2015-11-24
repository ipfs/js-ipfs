'use strict'

describe('.commands', function () {
  this.timeout(10000)
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
