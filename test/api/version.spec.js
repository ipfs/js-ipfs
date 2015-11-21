'use strict'

describe('.version', function () {
  it('checks the version', function (done) {
    this.timeout(10000)
    apiClients['a'].version((err, res) => {
      if (err) {
        throw err
      }
      assert(res)
      assert(res.Version)
      console.log('      - running against version', res.Version)
      done()
    })
  })
})
