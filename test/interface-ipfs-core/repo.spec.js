/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect

describe('.repo', () => {
  it('.repo.gc', (done) => {
    apiClients.a.repo.gc((err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      done()
    })
  })

  it('.repo.stat', (done) => {
    apiClients.a.repo.stat((err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      expect(res).to.have.a.property('NumObjects')
      expect(res).to.have.a.property('RepoSize')
      done()
    })
  })

  describe('promise', () => {
    it('.repo.gc', () => {
      return apiClients.a.repo.gc()
        .then((res) => {
          expect(res).to.exist
        })
    })

    it('.repo.stat', () => {
      return apiClients.a.repo.stat()
        .then((res) => {
          expect(res).to.exist
          expect(res).to.have.a.property('NumObjects')
          expect(res).to.have.a.property('RepoSize')
        })
    })
  })
})
