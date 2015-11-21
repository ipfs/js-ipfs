'use strict'
describe('nodes', function () {
  it('connect Node a to b and c', function (done) {
    this.timeout(5000)

    const addrs = {}
    let counter = 0
    collectAddr('b', finish)
    collectAddr('c', finish)

    function finish () {
      counter++
      if (counter === 2) {
        dial()
      }
    }

    function collectAddr (key, cb) {
      apiClients[key].id((err, id) => {
        if (err) {
          throw err
        }
        // note to self: HTTP API port !== Node port
        addrs[key] = id.Addresses[0]
        cb()
      })
    }

    function dial () {
      apiClients['a'].swarm.connect(addrs['b'], (err, res) => {
        if (err) {
          throw err
        }
        apiClients['a'].swarm.connect(addrs['c'], err => {
          if (err) {
            throw err
          }
          done()
        })
      })
    }
  })
})
