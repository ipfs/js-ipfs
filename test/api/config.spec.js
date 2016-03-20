/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const path = require('path')

describe('.config', () => {
  describe('.config.{set, get}', () => {
    it('string', (done) => {
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

    it('bool', (done) => {
      const confKey = 'otherKey'
      const confVal = true

      apiClients['a'].config.set(confKey, confVal, (err, res) => {
        expect(err).to.not.exist
        apiClients['a'].config.get(confKey, (err, res) => {
          expect(err).to.not.exist
          expect(res.Value).to.deep.equal(confVal)
          done()
        })
      })
    })

    it('json', (done) => {
      const confKey = 'API.HTTPHeaders.Access-Control-Allow-Origin'
      const confVal = ['http://example.io']

      apiClients['a'].config.set(confKey, confVal, (err, res) => {
        expect(err).to.not.exist
        apiClients['a'].config.get(confKey, (err, res) => {
          expect(err).to.not.exist
          expect(res.Value).to.deep.equal(confVal)
          done()
        })
      })
    })
  })

  it('.config.show', (done) => {
    apiClients.c.config.show((err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      done()
    })
  })

  it('.config.replace', (done) => {
    if (!isNode) {
      return done()
    }

    apiClients.c.config.replace(path.join(__dirname, '/../r-config.json'), (err, res) => {
      expect(err).to.not.exist
      expect(res).to.be.equal(null)
      done()
    })
  })

  describe('promise', () => {
    describe('.config.{set, get}', () => {
      it('string', () => {
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

      it('bool', () => {
        const confKey = 'otherKey'
        const confVal = true

        return apiClients['a'].config.set(confKey, confVal)
          .then((res) => {
            return apiClients['a'].config.get(confKey)
          })
          .then((res) => {
            expect(res.Value).to.deep.equal(confVal)
          })
      })

      it('json', () => {
        const confKey = 'API.HTTPHeaders.Access-Control-Allow-Origin'
        const confVal = ['http://example.com']

        return apiClients['a'].config.set(confKey, confVal)
          .then((res) => {
            return apiClients['a'].config.get(confKey)
          })
          .then((res) => {
            expect(res.Value).to.deep.equal(confVal)
          })
      })
    })

    it('.config.show', () => {
      return apiClients.c.config.show()
        .then((res) => {
          expect(res).to.exist
        })
    })

    it('.config.replace', () => {
      if (!isNode) {
        return
      }

      return apiClients.c.config.replace(path.join(__dirname, '/../r-config.json'))
        .then((res) => {
          expect(res).to.be.equal(null)
        })
    })
  })
})
