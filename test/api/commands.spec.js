'use strict'

describe('.commands', () => {
  it('lists commands', done => {
    apiClients['a'].commands((err, res) => {
      if (err) {
        throw err
      }
      assert(res)
      done()
    })
  })
})
