'use strict'

describe('.name', function () {
  let name

  it('.name.publish', function (done) {
    apiClients['a'].name.publish('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
      if (err) {
        throw err
      }
      assert(res)
      name = res
      done()
    })
  })

  it('.name.resolve', function (done) {
    apiClients['a'].name.resolve(name.Name, (err, res) => {
      if (err) {
        throw err
      }

      assert(res)
      assert.deepEqual(res, { Path: '/ipfs/' + name.Value })
      done()
    })
  })
})
