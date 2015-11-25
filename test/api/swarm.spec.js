'use strict'

describe('.swarm', () => {
  it('.swarm.peers', done => {
    apiClients['a'].swarm.peers((err, res) => {
      if (err) {
        throw err
      }

      assert(res.Strings.length >= 2)
      done()
    })
  })
  it('.swarm.connect', done => {
    // Done in the 'before' segment
    done()
  })
})
