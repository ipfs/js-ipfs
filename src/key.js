/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const hat = require('hat')

module.exports = (common) => {
  describe('.key', () => {
    const keyTypes = [
      {type: 'rsa', size: 2048}
    ]
    const keys = []
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

    describe('.gen', () => {
      keyTypes.forEach((kt) => {
        it(`creates a new ${kt.type} key`, function (done) {
          this.timeout(20 * 1000)
          const name = hat()
          ipfs.key.gen(name, kt, (err, key) => {
            expect(err).to.not.exist()
            expect(key).to.exist()
            expect(key).to.have.property('Name', name)
            expect(key).to.have.property('Id')
            keys.push(key)
            done()
          })
        })
      })
    })

    describe('.list', () => {
      let listedKeys
      it('lists all the keys', (done) => {
        ipfs.key.list((err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          expect(res.Keys).to.exist()
          expect(res.Keys.length).to.be.above(keys.length - 1)
          listedKeys = res.Keys
          done()
        })
      })

      it('contains the created keys', () => {
        keys.forEach(ki => {
          const found = listedKeys.filter(lk => ki.Name === lk.Name && ki.Id === lk.Id)
          expect(found).to.have.length(1)
        })
      })
    })

    describe('.rename', () => {
      let oldName
      let newName

      before(() => {
        oldName = keys[0].Name
        newName = 'x' + oldName
      })

      it('renames a key', (done) => {
        ipfs.key.rename(oldName, newName, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          expect(res).to.have.property('Was', oldName)
          expect(res).to.have.property('Now', newName)
          expect(res).to.have.property('Id', keys[0].Id)
          keys[0].Name = newName
          done()
        })
      })

      it('contains the new name', (done) => {
        ipfs.key.list((err, res) => {
          expect(err).to.not.exist()
          const found = res.Keys.filter(k => k.Name === newName)
          expect(found).to.have.length(1)
          done()
        })
      })

      it('does not contain the old name', (done) => {
        ipfs.key.list((err, res) => {
          expect(err).to.not.exist()
          const found = res.Keys.filter(k => k.Name === oldName)
          expect(found).to.have.length(0)
          done()
        })
      })
    })

    describe('.rm', () => {
      let key
      before(() => {
        key = keys[0]
      })

      it('removes a key', function (done) {
        ipfs.key.rm(key.name, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          expect(res).to.have.property('Keys')
          expect(res.Keys).to.have.length(1)
          expect(res.Keys[0]).to.have.property('Name', key.Name)
          expect(res.Keys[0]).to.have.property('Id', key.Id)
          done()
        })
      })

      it('does not contain the removed name', (done) => {
        ipfs.key.list((err, res) => {
          expect(err).to.not.exist()
          const found = res.Keys.filter(k => k.Name === key.name)
          expect(found).to.have.length(0)
          done()
        })
      })
    })
  })
}
