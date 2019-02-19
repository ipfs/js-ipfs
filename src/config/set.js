/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.config.set', function () {
    this.timeout(30 * 1000)
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

    it('should set a new key', (done) => {
      ipfs.config.set('Fruit', 'banana', (err) => {
        expect(err).to.not.exist()
        ipfs.config.get('Fruit', (err, fruit) => {
          expect(err).to.not.exist()
          expect(fruit).to.equal('banana')
          done()
        })
      })
    })

    it('should set a new key (promised)', () => {
      return ipfs.config.set('Fruit', 'banana')
        .then(() => ipfs.config.get('Fruit'))
        .then((fruit) => {
          expect(fruit).to.equal('banana')
        })
    })

    it('should set an already existing key', (done) => {
      ipfs.config.set('Fruit', 'morango', (err) => {
        expect(err).to.not.exist()
        ipfs.config.get('Fruit', (err, fruit) => {
          expect(err).to.not.exist()
          expect(fruit).to.equal('morango')
          done()
        })
      })
    })

    it('should set a JSON object', (done) => {
      const key = 'API.HTTPHeaders.Access-Control-Allow-Origin'
      const val = ['http://example.io']
      ipfs.config.set(key, val, function (err) {
        expect(err).to.not.exist()
        ipfs.config.get(key, function (err, result) {
          expect(err).to.not.exist()
          expect(result).to.deep.equal(val)
          done()
        })
      })
    })

    it('should fail on non valid key', (done) => {
      ipfs.config.set(Buffer.from('heeey'), '', (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should fail on non valid value', (done) => {
      ipfs.config.set('Fruit', Buffer.from('abc'), (err) => {
        expect(err).to.exist()
        done()
      })
    })
  })
}
