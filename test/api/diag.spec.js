'use strict'

describe('.diag', () => {
  it('.diag.net', done => {
    apiClients['a'].diag.net((err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      done()
    })
  })

  it('.diag.sys', done => {
    apiClients['a'].diag.sys((err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      expect(res).to.have.a.property('memory')
      expect(res).to.have.a.property('diskinfo')
      done()
    })
  })
})
