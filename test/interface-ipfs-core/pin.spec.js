/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect

describe('.pin', () => {
  it('.pin.add', (done) => {
    apiClients.b.pin.add('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {recursive: false}, (err, res) => {
      expect(err).to.not.exist
      expect(res.Pins[0]).to.be.equal('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      done()
    })
  })

  it('.pin.list', (done) => {
    apiClients.b.pin.list((err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      done()
    })
  })

  it('.pin.list hash', (done) => {
    apiClients.b.pin.list({hash: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'}, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      done()
    })
  })

  it('.pin.remove', (done) => {
    apiClients.b.pin.remove('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {recursive: false}, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      apiClients.b.pin.list('direct', (err, res) => {
        expect(err).to.not.exist
        expect(res).to.exist
        expect(res.Keys).to.be.empty
        done()
      })
    })
  })

  describe('promise', () => {
    it('.pin.add', () => {
      return apiClients.b.pin
        .add('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {recursive: false})
        .then((res) => {
          expect(res.Pins[0]).to.be.equal('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        })
    })

    it('.pin.list', () => {
      return apiClients.b.pin.list()
        .then((res) => {
          expect(res).to.exist
        })
    })

    it('.pin.list hash', () => {
      return apiClients.b.pin.list({
        hash: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
      })
        .then((res) => {
          expect(res).to.exist
        })
    })

    it('.pin.remove', () => {
      return apiClients.b.pin
        .remove('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {recursive: false})
        .then((res) => {
          expect(res).to.exist
          return apiClients.b.pin.list('direct')
        })
        .then((res) => {
          expect(res).to.exist
          expect(res.Keys).to.be.empty
        })
    })
  })
})
