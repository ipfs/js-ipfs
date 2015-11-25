'use strict'

describe('.config', () => {
  it('.config.{set, get}', done => {
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

  it('.config.show', done => {
    apiClients['c'].config.show((err, res) => {
      if (err) {
        throw err
      }

      assert(res)
      done()
    })
  })

  it('.config.replace', done => {
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
