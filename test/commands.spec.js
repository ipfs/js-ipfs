/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const FactoryClient = require('./ipfs-factory/client')

describe('.commands', function () {
  this.timeout(20 * 1000)

  let ipfs
  let fc

  before((done) => {
    fc = new FactoryClient()
    fc.spawnNode((err, node) => {
      expect(err).to.not.exist()
      ipfs = node
      done()
    })
  })

  after((done) => {
    fc.dismantle(done)
  })

  it('lists commands', (done) => {
    ipfs.commands((err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()
      done()
    })
  })

  describe('promise', () => {
    it('lists commands', () => {
      return ipfs.commands()
        .then((res) => {
          expect(res).to.exist()
        })
    })
  })
})
