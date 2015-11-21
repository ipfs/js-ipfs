'use strict'

describe('.commands', function () {
  it('lists commands', function (done) {
    this.timeout(10000)
    apiClients['a'].commands((err, res) => {
      if (err) {
        throw err
      }
      assert(res)
      done()
    })
  })
})
