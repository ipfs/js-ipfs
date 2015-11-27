'use strict'

describe('.commands', () => {
  it('lists commands', done => {
    apiClients['a'].commands((err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      done()
    })
  })
})
