/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 6] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const hat = require('hat')
const { getDescribe, getIt } = require('../utils/mocha')

const expect = chai.expect
chai.use(dirtyChai)

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.key.rename', () => {
    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => common.teardown(done))

    it('should rename a key', function (done) {
      this.timeout(30 * 1000)

      const oldName = hat()
      const newName = hat()

      ipfs.key.gen(oldName, { type: 'rsa', size: 2048 }, (err, key) => {
        expect(err).to.not.exist()

        ipfs.key.rename(oldName, newName, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          expect(res).to.have.property('was', oldName)
          expect(res).to.have.property('now', newName)
          expect(res).to.have.property('id', key.id)

          ipfs.key.list((err, res) => {
            expect(err).to.not.exist()
            expect(res.find(k => k.name === newName)).to.exist()
            expect(res.find(k => k.name === oldName)).to.not.exist()
            done()
          })
        })
      })
    })
  })
}
