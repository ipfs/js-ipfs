/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const loadFixture = require('aegir/fixtures')

let testfile
if (isNode) {
  testfile = loadFixture(__dirname, '../fixtures/testfile.txt')
} else {
  testfile = loadFixture(__dirname, 'fixtures/testfile.txt')
}

describe('.name', () => {
  let name

  it('add file for testing', (done) => {
    const expectedMultihash = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'

    apiClients.a.files.add(testfile, (err, res) => {
      expect(err).to.not.exist

      expect(res).to.have.length(1)
      expect(res[0].hash).to.equal(expectedMultihash)
      expect(res[0].path).to.equal(expectedMultihash)
      done()
    })
  })

  it('.name.publish', (done) => {
    apiClients.a.name.publish('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
      expect(err).to.not.exist
      name = res
      expect(name).to.exist
      done()
    })
  })

  it('.name.resolve', (done) => {
    apiClients.a.name.resolve(name.Name, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      expect(res).to.be.eql({
        Path: '/ipfs/' + name.Value
      })
      done()
    })
  })

  describe('promise', () => {
    it('.name.publish', () => {
      return apiClients.a.name.publish('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        .then((res) => {
          name = res
          expect(name).to.exist
        })
    })

    it('.name.resolve', () => {
      return apiClients.a.name.resolve(name.Name)
        .then((res) => {
          expect(res).to.exist
          expect(res).to.be.eql({
            Path: '/ipfs/' + name.Value
          })
        })
    })
  })
})
