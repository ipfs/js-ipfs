'use strict'

describe('.diag', function () {
  this.timeout(1000000)

  it('.diag.net', function (done) {
    apiClients['a'].diag.net((err, res) => {
      if (err) {
        throw err
      }
      assert(res)
      done()
    })
  })

  it('.diag.sys', function (done) {
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
