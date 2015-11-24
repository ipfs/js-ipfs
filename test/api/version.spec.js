'use strict'

describe('.version', function () {
  this.timeout(60000)
  it('checks the version', function (done) {
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
