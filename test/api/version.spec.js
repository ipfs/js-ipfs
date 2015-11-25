'use strict'

describe('.version', () => {
  it('checks the version', done => {
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
