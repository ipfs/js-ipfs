'use strict'

const path = require('path')

describe('.config', () => {
  it('.config.{set, get}', (done) => {
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

  it('.config.show', (done) => {
    apiClients['c'].config.show((err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      done()
    })
  })

  it('.config.replace', (done) => {
    if (!isNode) {
      return done()
    }

    apiClients['c'].config.replace(path.join(__dirname, '/../r-config.json'), (err, res) => {
      expect(err).to.not.exist
      expect(res).to.be.equal(null)
      done()
    })
  })

  describe('promise', () => {
    it('.config.{set, get}', () => {
      const confKey = 'arbitraryKey'
      const confVal = 'arbitraryVal'

      return apiClients['a'].config.set(confKey, confVal)
        .then((res) => {
          return apiClients['a'].config.get(confKey)
        })
        .then((res) => {
          expect(res).to.have.a.property('Value', confVal)
        })
    })

    it('.config.show', () => {
      return apiClients['c'].config.show()
        .then((res) => {
          expect(res).to.exist
        })
    })

    it('.config.replace', () => {
      if (!isNode) {
        return
      }

      return apiClients['c'].config.replace(path.join(__dirname, '/../r-config.json'))
        .then((res) => {
          expect(res).to.be.equal(null)
        })
    })
  })
})
