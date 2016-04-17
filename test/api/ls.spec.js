/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')

describe('ls', function () {
  it('should correctly retrieve links', function (done) {
    if (!isNode) return done()

    apiClients.a.ls('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', (err, res) => {
      expect(err).to.not.exist

      expect(res).to.have.a.property('Objects')
      expect(res.Objects[0]).to.have.a.property('Links')
      expect(res.Objects[0]).to.have.property('Hash', 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')
      done()
    })
  })

  it('should correctly handle a nonexisting hash', function (done) {
    apiClients.a.ls('surelynotavalidhashheh?', (err, res) => {
      expect(err).to.exist
      expect(res).to.not.exist
      done()
    })
  })

  it('should correctly handle a nonexisting path', function (done) {
    if (!isNode) return done()

    apiClients.a.ls('QmRNjDeKStKGTQXnJ2NFqeQ9oW23WcpbmvCVrpDHgDg3T6/folder_that_isnt_there', (err, res) => {
      expect(err).to.exist
      expect(res).to.not.exist
      done()
    })
  })

  describe('promise', () => {
    it('should correctly retrieve links', () => {
      if (!isNode) return

      return apiClients.a.ls('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')
        .then((res) => {
          expect(res).to.have.a.property('Objects')
          expect(res.Objects[0]).to.have.a.property('Links')
          expect(res.Objects[0]).to.have.property('Hash', 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')
        })
    })

    it('should correctly handle a nonexisting hash', () => {
      return apiClients.a.ls('surelynotavalidhashheh?')
        .catch((err) => {
          expect(err).to.exist
        })
    })

    it('should correctly handle a nonexisting path', () => {
      if (!isNode) return

      return apiClients.a.ls('QmRNjDeKStKGTQXnJ2NFqeQ9oW23WcpbmvCVrpDHgDg3T6/folder_that_isnt_there')
        .catch((err) => {
          expect(err).to.exist
        })
    })
  })
})
