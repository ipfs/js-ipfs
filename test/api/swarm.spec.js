'use strict'

describe('.swarm', function () {
  it('.swarm.peers', function (done) {
    this.timeout(5000)

    apiClients['a'].swarm.peers((err, res) => {
      if (err) {
        throw err
      }

      assert(res.Strings.length >= 2)
      done()
    })
  })
  it('.swarm.connect', function (done) {
    // Done in the 'before' segment
    done()
  })
})
