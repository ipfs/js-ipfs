/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (common) => {
  describe('.config', () => {
    let ipfs

    before((done) => {
      common.setup((err, _ipfs) => {
        expect(err).to.not.exist
        ipfs = _ipfs
        done()
      })
    })

    after((done) => {
      common.teardown(done)
    })

    describe('callback API', () => {
      describe('.get', () => {
        it('retrieve the whole config', (done) => {
          ipfs.config.get((err, config) => {
            expect(err).to.not.exist
            expect(config).to.exist
            done()
          })
        })

        it('retrieve a value through a key', (done) => {
          ipfs.config.get('Identity', (err, identity) => {
            expect(err).to.not.exist
            expect(identity).to.exist
            done()
          })
        })

        it('retrieve a value through a nested key', (done) => {
          ipfs.config.get('Addresses.Swarm', (err, swarmAddrs) => {
            expect(err).to.not.exist
            expect(swarmAddrs).to.exist
            done()
          })
        })

        it('fail on non valid key', (done) => {
          ipfs.config.get(1234, (err, peerId) => {
            expect(err).to.exist
            done()
          })
        })

        it('fail on non existent key', (done) => {
          ipfs.config.get('Bananas', (err, peerId) => {
            expect(err).to.exist
            done()
          })
        })
      })
      describe('.set', () => {
        it('set a new key', (done) => {
          ipfs.config.set('Fruit', 'banana', (err) => {
            expect(err).to.not.exist
            ipfs.config.get('Fruit', (err, fruit) => {
              expect(err).to.not.exist
              expect(fruit).to.equal('banana')
              done()
            })
          })
        })

        it('set an already existing key', (done) => {
          ipfs.config.set('Fruit', 'morango', (err) => {
            expect(err).to.not.exist
            ipfs.config.get('Fruit', (err, fruit) => {
              expect(err).to.not.exist
              expect(fruit).to.equal('morango')
              done()
            })
          })
        })

        it('set a JSON object', (done) => {
          const key = 'API.HTTPHeaders.Access-Control-Allow-Origin'
          const val = ['http://example.io']
          ipfs.config.set(key, val, function (err) {
            expect(err).to.not.exist
            ipfs.config.get(key, function (err, result) {
              expect(err).to.not.exist
              expect(result).to.deep.equal(val)
              done()
            })
          })
        })

        it('fail on non valid key', (done) => {
          ipfs.config.set(new Buffer('heeey'), '', (err) => {
            expect(err).to.exist
            done()
          })
        })

        it('fail on non valid value', (done) => {
          ipfs.config.set('Fruit', new Buffer('abc'), (err) => {
            expect(err).to.exist
            done()
          })
        })
      })

      // Waiting for fix on go-ipfs
      // - https://github.com/ipfs/js-ipfs-api/pull/307#discussion_r69281789
      // - https://github.com/ipfs/go-ipfs/issues/2927
      describe.skip('.replace', () => {
        const config = {
          Fruit: 'Bananas'
        }

        it('replace the whole config', (done) => {
          ipfs.config.replace(config, (err) => {
            expect(err).to.not.exist
            ipfs.config.get((err, _config) => {
              expect(err).to.not.exist
              expect(_config).to.deep.equal(config)
            })
          })
        })

        it('replace to empty config', (done) => {
          ipfs.config.replace({}, (err) => {
            expect(err).to.not.exist
            ipfs.config.get((err, _config) => {
              expect(err).to.not.exist
              expect(_config).to.deep.equal(config)
            })
          })
        })
      })
    })

    describe('promise API', () => {
      describe('.get', () => {
        it('retrieve the whole config', () => {
          return ipfs.config.get()
            .then((config) => {
              expect(config).to.exist
            })
        })
      })

      describe('.set', () => {
        it('set a new key', () => {
          return ipfs.config.set('Fruit', 'banana')
            .then(() => {
              ipfs.config.get('Fruit', (err, fruit) => {
                expect(err).to.not.exist
                expect(fruit).to.equal('banana')
              })
            })
        })
      })

      // Waiting for fix on go-ipfs
      // - https://github.com/ipfs/js-ipfs-api/pull/307#discussion_r69281789
      // - https://github.com/ipfs/go-ipfs/issues/2927
      describe.skip('.replace', () => {})
    })
  })
}
