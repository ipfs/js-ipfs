'use strict'

describe('.version', () => {
  it('checks the version', done => {
    apiClients['a'].version((err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.a.property('Version')
      console.log('      - running against version', res.Version)
      done()
    })
  })
})
