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
    let withGo

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          ipfs.id((err, id) => {
            expect(err).to.not.exist()
            withGo = id.agentVersion.startsWith('go-ipfs')
            done()
          })
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
            expect(key).to.have.property('name', name)
            expect(key).to.have.property('id')
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
          expect(res).to.be.an('array')
          expect(res.length).to.be.above(keys.length - 1)
          listedKeys = res
          done()
        })
      })

      it('contains the created keys', () => {
        keys.forEach(ki => {
          const found = listedKeys.filter(lk => ki.name === lk.name && ki.id === lk.id)
          expect(found).to.have.length(1)
        })
      })
    })

    describe('.rename', () => {
      let oldName
      let newName

      before(() => {
        oldName = keys[0].name
        newName = 'x' + oldName
      })

      it('renames a key', (done) => {
        ipfs.key.rename(oldName, newName, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          expect(res).to.have.property('was', oldName)
          expect(res).to.have.property('now', newName)
          expect(res).to.have.property('id', keys[0].id)
          keys[0].name = newName
          done()
        })
      })

      it('contains the new name', (done) => {
        ipfs.key.list((err, res) => {
          expect(err).to.not.exist()
          const found = res.filter(k => k.name === newName)
          expect(found).to.have.length(1)
          done()
        })
      })

      it('does not contain the old name', (done) => {
        ipfs.key.list((err, res) => {
          expect(err).to.not.exist()
          const found = res.filter(k => k.name === oldName)
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
          expect(res).to.have.property('name', key.name)
          expect(res).to.have.property('id', key.id)
          done()
        })
      })

      it('does not contain the removed name', (done) => {
        ipfs.key.list((err, res) => {
          expect(err).to.not.exist()
          const found = res.filter(k => k.name === key.name)
          expect(found).to.have.length(0)
          done()
        })
      })
    })

    describe('exchange', () => {
      let selfPem
      let passwordPem = hat()

      it('exports', function (done) {
        if (withGo) {
          console.log('Not supported by go-ipfs yet')
          this.skip()
        }
        ipfs.key.export('self', passwordPem, (err, pem) => {
          expect(err).to.not.exist()
          expect(pem).to.exist()
          selfPem = pem
          done()
        })
      })

      it('imports', function (done) {
        if (withGo) {
          console.log('Not supported by go-ipfs yet')
          this.skip()
        }
        ipfs.key.import('clone', selfPem, passwordPem, (err, key) => {
          expect(err).to.not.exist()
          expect(key).to.exist()
          expect(key).to.have.property('name', 'clone')
          expect(key).to.have.property('id')
          done()
        })
      })

      it('removes', function (done) {
        if (withGo) {
          console.log('Not supported by go-ipfs yet')
          this.skip()
        }
        ipfs.key.rm('clone', (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })
  })
}
