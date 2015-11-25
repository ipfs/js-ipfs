'use strict'

describe('.diag', () => {
  it('.diag.net', done => {
    apiClients['a'].diag.net((err, res) => {
      if (err) {
        throw err
      }
      assert(res)
      done()
    })
  })

  it('.diag.sys', done => {
    apiClients['a'].diag.sys((err, res) => {
      if (err) {
        throw err
      }
      assert(res)
      assert(res.memory)
      assert(res.diskinfo)
      done()
    })
  })
})
