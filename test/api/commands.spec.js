/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect

describe('.commands', () => {
  it('lists commands', (done) => {
    apiClients.a.commands((err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      done()
    })
  })

  describe('promise', () => {
    it('lists commands', () => {
      return apiClients.a.commands()
        .then((res) => {
          expect(res).to.exist
        })
    })
  })
})
