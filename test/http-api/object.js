/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const fs = require('fs')
const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ exec: 'src/cli/bin.js' })

function asJson (cb) {
  return (err, result) => {
    expect(err).to.not.exist()
    const nodeJSON = result.toJSON()
    cb(null, nodeJSON)
  }
}

describe('object endpoint', () => {
  let ipfs = null
  let ipfsd = null
  before(function (done) {
    this.timeout(20 * 1000)

    df.spawn({
      initOptions: { bits: 512 },
      config: {
        Bootstrap: [],
        Discovery: {
          MDNS: {
            Enabled: false
          },
          webRTCStar: {
            Enabled: false
          }
        }
      }
    }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = ipfsd.api
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  describe('.object', () => {
    it('.new', (done) => {
      ipfs.object.new((err, cid) => {
        expect(err).to.not.exist()
        expect(cid.toBaseEncodedString())
          .to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')

        ipfs.object.get(cid, asJson((err, res) => {
          expect(err).to.not.exist()
          expect(res.links).to.be.eql([])
          done()
        }))
      })
    })

    describe('.get', () => {
      it('returns error for request without argument', (done) => {
        ipfs.object.get(null, (err, result) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns error for request with invalid argument', (done) => {
        ipfs.object.get('invalid', { enc: 'base58' }, (err, result) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns value', (done) => {
        ipfs.object.get('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n', { enc: 'base58' }, asJson((err, res) => {
          expect(err).to.not.exist()
          expect(res.links).to.be.eql([])
          expect(res.data).to.eql(Buffer.from(''))
          done()
        }))
      })
    })

    describe('.put', () => {
      it('returns error if the node is invalid', (done) => {
        const filePath = 'test/fixtures/test-data/badnode.json'

        ipfs.object.put(filePath, { enc: 'json' }, (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('updates value', (done) => {
        const filePath = fs.readFileSync('test/fixtures/test-data/node.json')
        const expectedResult = {
          data: Buffer.from('another'),
          links: [{
            name: 'some link',
            cid: 'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V',
            size: 8
          }],
          size: 68
        }

        ipfs.object.put(filePath, { enc: 'json' }, (err, cid) => {
          expect(err).to.not.exist()
          expect(cid.toBaseEncodedString())
            .to.equal('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')

          ipfs.object.get(cid, asJson((err, res) => {
            expect(err).to.not.exist()
            expect(res).to.eql(expectedResult)
            done()
          }))
        })
      })
    })

    describe('.stat', () => {
      it('returns error for request without argument', (done) => {
        ipfs.object.stat(null, (err, result) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns error for request with invalid argument', (done) => {
        ipfs.object.stat('invalid', { enc: 'base58' }, (err, result) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns value', (done) => {
        ipfs.object.stat('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm', { enc: 'base58' }, (err, result) => {
          expect(err).to.not.exist()
          expect(result.Hash).to.equal('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
          expect(result.NumLinks).to.equal(1)
          expect(result.BlockSize).to.equal(60)
          expect(result.LinksSize).to.equal(60 - 7)
          expect(result.DataSize).to.equal(7)
          expect(result.CumulativeSize).to.equal(60 + 8)
          done()
        })
      })
    })

    describe('.data', () => {
      it('returns error for request without argument', (done) => {
        ipfs.object.data(null, (err, result) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns error for request with invalid argument', (done) => {
        ipfs.object.data('invalid', { enc: 'base58' }, (err, result) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns value', (done) => {
        ipfs.object.data('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm', { enc: 'base58' }, (err, result) => {
          expect(err).to.not.exist()
          expect(result.toString()).to.equal('another')
          done()
        })
      })
    })

    describe('.links', () => {
      it('returns error for request without argument', (done) => {
        ipfs.object.links(null, (err, result) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns error for request with invalid argument', (done) => {
        ipfs.object.links('invalid', { enc: 'base58' }, (err, result) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns value', (done) => {
        const expectedResult = {
          name: 'some link',
          cid: 'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V',
          size: 8
        }

        ipfs.object.links('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm', { enc: 'base58' }, (err, result) => {
          expect(err).to.not.exist()
          expect(result[0].toJSON()).to.deep.equal(expectedResult)
          done()
        })
      })
    })

    describe('.patch.appendData', () => {
      it('returns error for request without key & data', (done) => {
        ipfs.object.patch.appendData(null, null, (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns error for request without data', (done) => {
        const filePath = 'test/fixtures/test-data/badnode.json'

        ipfs.object.patch.appendData(null, filePath, (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('updates value', (done) => {
        const key = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
        const filePath = 'test/fixtures/test-data/badnode.json'
        const expectedResult = {
          data: fs.readFileSync(filePath),
          links: [],
          size: 19
        }

        ipfs.object.patch.appendData(key, filePath, { enc: 'base58' }, (err, cid) => {
          expect(err).to.not.exist()
          expect(cid.toBaseEncodedString())
            .to.equal('QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6')

          ipfs.object.get(cid, asJson((err, res) => {
            expect(err).to.not.exist()
            expect(res).to.eql(expectedResult)
            done()
          }))
        })
      })
    })

    describe('.patch.setData', () => {
      it('returns error for request without key & data', (done) => {
        ipfs.object.patch.setData(null, null, (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns error for request without data', (done) => {
        const filePath = 'test/fixtures/test-data/badnode.json'

        ipfs.object.patch.setData(null, filePath, (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('updates value', (done) => {
        const key = 'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6'
        const filePath = 'test/fixtures/test-data/badnode.json'
        const expectedResult = {
          data: fs.readFileSync(filePath),
          links: [],
          size: 19
        }

        ipfs.object.patch.setData(key, filePath, { enc: 'base58' }, (err, cid) => {
          expect(err).to.not.exist()
          expect(cid.toBaseEncodedString())
            .to.equal('QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6')

          ipfs.object.get(cid, asJson((err, res) => {
            expect(err).to.not.exist()
            expect(res).to.eql(expectedResult)
            done()
          }))
        })
      })
    })

    describe('.patch.addLink', () => {
      it('returns error for request without arguments', (done) => {
        ipfs.object.patch.addLink(null, null, null, (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns error for request only one invalid argument', (done) => {
        ipfs.object.patch.addLink('invalid', null, null, (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns error for request without name', (done) => {
        const root = 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
        const name = ''
        const ref = 'QmTz3oc4gdpRMKP2sdGUPZTAGRngqjsi99BPoztyP53JMM'
        const link = new DAGLink(name, 2, ref)
        ipfs.object.patch.addLink(root, link, { enc: 'base58' }, (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('updates value', (done) => {
        const root = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
        const name = 'foo'
        const ref = 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
        const link = new DAGLink(name, 10, ref)

        ipfs.object.patch.addLink(root, link, { enc: 'base58' }, (err, cid) => {
          expect(err).not.to.exist()
          expect(cid.toBaseEncodedString())
            .to.equal('QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK')

          ipfs.object.get(cid, asJson((err, res) => {
            expect(err).to.not.exist()
            expect(res.links[0]).to.eql({
              name: 'foo',
              cid: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
              size: 4
            })
            done()
          }))
        })
      })
    })

    describe('.patch.rmLink', () => {
      it('returns error for request without arguments', (done) => {
        ipfs.object.patch.rmLink(null, null, (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns error for request only one invalid argument', (done) => {
        ipfs.object.patch.rmLink('invalid', null, (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns error for request with invalid first argument', (done) => {
        const root = ''
        const link = 'foo'

        ipfs.object.patch.rmLink(root, link, (err) => {
          expect(err).to.exist()
          done()
        })
      })
    })
  })
})
