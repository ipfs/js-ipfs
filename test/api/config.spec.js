'use strict'

describe('.config', function () {
  it('.config.{set, get}', function (done) {
    this.timeout(10000)

    const confKey = 'arbitraryKey'
    const confVal = 'arbitraryVal'

    apiClients['a'].config.set(confKey, confVal, (err, res) => {
      if (err) throw err
      apiClients['a'].config.get(confKey, (err, res) => {
        if (err) throw err
        assert.equal(res.Value, confVal)
        done()
      })
    })
  })

  it('.config.show', function (done) {
    this.timeout(10000)

    apiClients['c'].config.show((err, res) => {
      if (err) {
        throw err
      }

      assert(res)
      done()
    })
  })

  it('.config.replace', function (done) {
    this.timeout(10000)

    if (!isNode) {
      return done()
    }

    apiClients['c'].config.replace(__dirname + '/../r-config.json', (err, res) => {
      if (err) {
        throw err
      }

      assert.equal(res, null)
      done()
    })
  })
})
