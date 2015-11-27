'use strict'

describe('.config', () => {
  it('.config.{set, get}', done => {
    const confKey = 'arbitraryKey'
    const confVal = 'arbitraryVal'

    apiClients['a'].config.set(confKey, confVal, (err, res) => {
      expect(err).to.not.exist
      apiClients['a'].config.get(confKey, (err, res) => {
        expect(err).to.not.exist
        expect(res).to.have.a.property('Value', confVal)
        done()
      })
    })
  })

  it('.config.show', done => {
    apiClients['c'].config.show((err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      done()
    })
  })

  it('.config.replace', done => {
    if (!isNode) {
      return done()
    }

    apiClients['c'].config.replace(__dirname + '/../r-config.json', (err, res) => {
      expect(err).to.not.exist
      expect(res).to.be.equal(null)
      done()
    })
  })
})
