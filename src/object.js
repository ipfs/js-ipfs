/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const bs58 = require('bs58')
const series = require('async/series')

module.exports = (common) => {
  describe('.object', () => {
    let ipfs

    before(function (done) {
      // CI is slow
      this.timeout(20 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => {
      common.teardown(done)
    })

    describe('callback API', () => {
      describe('.new', () => {
        it('no layout', (done) => {
          ipfs.object.new((err, node) => {
            expect(err).to.not.exist()
            const nodeJSON = node.toJSON()
            expect(nodeJSON.multihash).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
            done()
          })
        })

        it('template unixfs-dir', (done) => {
          ipfs.object.new('unixfs-dir', (err, node) => {
            expect(err).to.not.exist()
            const nodeJSON = node.toJSON()
            expect(nodeJSON.multihash)
              .to.equal('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
            done()
          })
        })
      })

      describe('.put', () => {
        it('of object', (done) => {
          const obj = {
            Data: new Buffer('Some data'),
            Links: []
          }

          ipfs.object.put(obj, (err, node) => {
            expect(err).to.not.exist()
            const nodeJSON = node.toJSON()
            expect(nodeJSON.data).to.eql(obj.Data)
            expect(nodeJSON.links).to.eql(obj.Links)
            expect(nodeJSON.multihash).to.equal('QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK')
            done()
          })
        })

        it('of json encoded buffer', (done) => {
          const obj = {
            Data: new Buffer('Some data'),
            Links: []
          }

          const obj2 = {
            Data: obj.Data.toString(),
            Links: obj.Links
          }

          const buf = new Buffer(JSON.stringify(obj2))

          ipfs.object.put(buf, { enc: 'json' }, (err, node) => {
            expect(err).to.not.exist()
            const nodeJSON = node.toJSON()

            expect(nodeJSON.data).to.eql(node.data)
            expect(nodeJSON.multihash).to.equal('QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK')
            done()
          })
        })

        it('of protobuf encoded buffer', (done) => {
          let node
          let serialized

          series([
            (cb) => {
              DAGNode.create(new Buffer('Some data'), (err, _node) => {
                expect(err).to.not.exist()
                node = _node
                cb()
              })
            },
            (cb) => {
              dagPB.util.serialize(node, (err, _serialized) => {
                expect(err).to.not.exist()
                serialized = _serialized
                cb()
              })
            },
            (cb) => {
              ipfs.object.put(serialized, { enc: 'protobuf' }, (err, storedNode) => {
                expect(err).to.not.exist()
                expect(node.data).to.deep.equal(node.data)
                expect(node.links).to.deep.equal(node.links)
                expect(node.multihash).to.eql(storedNode.multihash)
                cb()
              })
            }
          ], done)
        })

        it('of buffer treated as Data field', (done) => {
          const data = new Buffer('Some data')
          ipfs.object.put(data, (err, node) => {
            expect(err).to.not.exist()
            const nodeJSON = node.toJSON()
            expect(data).to.deep.equal(nodeJSON.data)
            expect([]).to.deep.equal(nodeJSON.links)
            expect(nodeJSON.multihash).to.equal('QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK')
            done()
          })
        })

        it('of DAGNode', (done) => {
          DAGNode.create(new Buffer('Some data'), (err, dNode) => {
            expect(err).to.not.exist()
            ipfs.object.put(dNode, (err, node) => {
              expect(err).to.not.exist()
              expect(dNode.data).to.deep.equal(node.data)
              expect(dNode.links).to.deep.equal(node.links)
              done()
            })
          })
        })

        it('fails if String is passed', (done) => {
          ipfs.object.put('aaa', (err) => {
            expect(err).to.exist()
            done()
          })
        })

        it('DAGNode with a link', (done) => {
          let node1a
          let node1b
          let node2
          series([
            (cb) => {
              DAGNode.create(new Buffer('Some data 1'), (err, node) => {
                expect(err).to.not.exist()
                node1a = node
                cb()
              })
            },
            (cb) => {
              DAGNode.create(new Buffer('Some data 2'), (err, node) => {
                expect(err).to.not.exist()
                node2 = node
                cb()
              })
            },
            (cb) => {
              const link = node2.toJSON()
              link.name = 'some-link'
              DAGNode.addLink(node1a, link, (err, node) => {
                expect(err).to.not.exist()
                node1b = node
                cb()
              })
            },
            (cb) => {
              ipfs.object.put(node1b, (err, node) => {
                expect(err).to.not.exist()
                expect(node1b.data).to.deep.equal(node.data)
                expect(node1b.links.map((l) => l.toJSON()))
                  .to.deep.equal(node.links.map((l) => l.toJSON()))
                cb()
              })
            }
          ], done)
        })
      })

      describe('.get', () => {
        it('with multihash', (done) => {
          const obj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          let node1
          let node2

          series([
            (cb) => {
              ipfs.object.put(obj, (err, node) => {
                expect(err).to.not.exist()
                node1 = node
                cb()
              })
            },
            (cb) => {
              ipfs.object.get(node1.multihash, (err, node) => {
                expect(err).to.not.exist()
                node2 = node

                // because js-ipfs-api can't infer if the
                // returned Data is Buffer or String
                if (typeof node2.data === 'string') {
                  node2.data = new Buffer(node2.data)
                }
                cb()
              })
            },
            (cb) => {
              expect(node1.data).to.eql(node2.data)
              expect(node1.links).to.eql(node2.links)
              expect(node1.multihash).to.eql(node2.multihash)
              cb()
            }
          ], done)
        })

        it('with multihash (+ links)', (done) => {
          let node1a
          let node1b
          let node1c
          let node2

          series([
            (cb) => {
              DAGNode.create(new Buffer('Some data 1'), (err, node) => {
                expect(err).to.not.exist()
                node1a = node
                cb()
              })
            },
            (cb) => {
              DAGNode.create(new Buffer('Some data 2'), (err, node) => {
                expect(err).to.not.exist()
                node2 = node
                cb()
              })
            },
            (cb) => {
              const link = node2.toJSON()
              link.name = 'some-link'
              DAGNode.addLink(node1a, link, (err, node) => {
                expect(err).to.not.exist()
                node1b = node
                cb()
              })
            },
            (cb) => {
              ipfs.object.put(node1b, cb)
            },
            (cb) => {
              ipfs.object.get(node1b.multihash, (err, node) => {
                expect(err).to.not.exist()

                // because js-ipfs-api can't infer if the
                // returned Data is Buffer or String
                if (typeof node.data === 'string') {
                  node.data = new Buffer(node.data)
                }

                node1c = node
                cb()
              })
            },
            (cb) => {
              expect(node1a.data).to.eql(node1c.data)
              expect(node1b.multihash).to.eql(node1c.multihash)
              cb()
            }
          ], done)
        })

        it('with multihash base58 encoded', (done) => {
          const obj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          let node1a
          let node1b

          series([
            (cb) => {
              ipfs.object.put(obj, (err, node) => {
                expect(err).to.not.exist()
                node1a = node
                cb()
              })
            },
            (cb) => {
              ipfs.object.get(node1a.multihash, { enc: 'base58' }, (err, node) => {
                expect(err).to.not.exist()
                // because js-ipfs-api can't infer if the
                // returned Data is Buffer or String
                if (typeof node.data === 'string') {
                  node.data = new Buffer(node.data)
                }
                node1b = node
                cb()
              })
            },
            (cb) => {
              expect(node1a.multihash).to.eql(node1b.multihash)
              expect(node1a.data).to.eql(node1b.data)
              expect(node1a.links).to.eql(node1b.links)
              cb()
            }
          ], done)
        })

        it('with multihash base58 encoded toString', (done) => {
          const obj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          let node1a
          let node1b

          series([
            (cb) => {
              ipfs.object.put(obj, (err, node) => {
                expect(err).to.not.exist()
                node1a = node
                cb()
              })
            },
            (cb) => {
              ipfs.object.get(bs58.encode(node1a.multihash).toString(), { enc: 'base58' }, (err, node) => {
                expect(err).to.not.exist()
                // because js-ipfs-api can't infer if the
                // returned Data is Buffer or String
                if (typeof node.data === 'string') {
                  node.data = new Buffer(node.data)
                }
                node1b = node
                cb()
              })
            },
            (cb) => {
              expect(node1a.multihash).to.eql(node1b.multihash)
              expect(node1a.data).to.eql(node1b.data)
              expect(node1a.links).to.eql(node1b.links)
              cb()
            }
          ], done)
        })
      })

      describe('.data', () => {
        it('with multihash', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist()

            ipfs.object.data(node.multihash, (err, data) => {
              expect(err).to.not.exist()

              // because js-ipfs-api can't infer
              // if the returned Data is Buffer or String
              if (typeof data === 'string') {
                data = new Buffer(data)
              }
              expect(node.data).to.eql(data)
              done()
            })
          })
        })

        it('with multihash base58 encoded', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist()

            ipfs.object.data(bs58.encode(node.multihash), { enc: 'base58' }, (err, data) => {
              expect(err).to.not.exist()

              // because js-ipfs-api can't infer
              // if the returned Data is Buffer or String
              if (typeof data === 'string') {
                data = new Buffer(data)
              }
              expect(node.data).to.eql(data)
              done()
            })
          })
        })

        it('with multihash base58 encoded toString', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist()

            ipfs.object.data(bs58.encode(node.multihash).toString(), { enc: 'base58' }, (err, data) => {
              expect(err).to.not.exist()

              // because js-ipfs-api can't infer if the
              // returned Data is Buffer or String
              if (typeof data === 'string') {
                data = new Buffer(data)
              }
              expect(node.data).to.eql(data)
              done()
            })
          })
        })
      })

      describe('.links', () => {
        it('object.links with multihash', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist()

            ipfs.object.links(node.multihash, (err, links) => {
              expect(err).to.not.exist()
              expect(node.links).to.deep.equal(links)
              done()
            })
          })
        })

        it('with multihash (+ links)', (done) => {
          let node1a
          let node1b
          let node2

          series([
            (cb) => {
              DAGNode.create(new Buffer('Some data 1'), (err, node) => {
                expect(err).to.not.exist()
                node1a = node
                cb()
              })
            },
            (cb) => {
              DAGNode.create(new Buffer('Some data 2'), (err, node) => {
                expect(err).to.not.exist()
                node2 = node
                cb()
              })
            },
            (cb) => {
              const link = node2.toJSON()
              link.name = 'some-link'

              DAGNode.addLink(node1a, link, (err, node) => {
                expect(err).to.not.exist()
                node1b = node
                cb()
              })
            },
            (cb) => {
              ipfs.object.put(node1b, cb)
            },
            (cb) => {
              ipfs.object.links(node1b.multihash, (err, links) => {
                expect(err).to.not.exist()
                expect(node1b.links[0].toJSON()).to.eql(links[0].toJSON())
                cb()
              })
            }
          ], done)
        })

        it('with multihash base58 encoded', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist()

            ipfs.object.links(bs58.encode(node.multihash), { enc: 'base58' }, (err, links) => {
              expect(err).to.not.exist()
              expect(node.links).to.deep.equal(links)
              done()
            })
          })
        })

        it('with multihash base58 encoded toString', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist()
            ipfs.object.links(bs58.encode(node.multihash), { enc: 'base58' }, (err, links) => {
              expect(err).to.not.exist()
              expect(node.links).to.deep.equal(links)
              done()
            })
          })
        })
      })

      describe('.stat', () => {
        it('with multihash', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist()

            ipfs.object.stat(node.multihash, (err, stats) => {
              expect(err).to.not.exist()
              const expected = {
                Hash: 'QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ',
                NumLinks: 0,
                BlockSize: 17,
                LinksSize: 2,
                DataSize: 15,
                CumulativeSize: 17
              }
              expect(expected).to.deep.equal(stats)
              done()
            })
          })
        })

        it('with multihash (+ Links)', (done) => {
          let node1a
          let node1b
          let node2

          series([
            (cb) => {
              DAGNode.create(new Buffer('Some data 1'), (err, node) => {
                expect(err).to.not.exist()
                node1a = node
                cb()
              })
            },
            (cb) => {
              DAGNode.create(new Buffer('Some data 2'), (err, node) => {
                expect(err).to.not.exist()
                node2 = node
                cb()
              })
            },
            (cb) => {
              const link = node2.toJSON()
              link.name = 'some-link'

              DAGNode.addLink(node1a, link, (err, node) => {
                expect(err).to.not.exist()
                node1b = node
                cb()
              })
            },
            (cb) => {
              ipfs.object.put(node1b, cb)
            },
            (cb) => {
              ipfs.object.stat(node1b.multihash, (err, stats) => {
                expect(err).to.not.exist()
                const expected = {
                  Hash: 'QmPR7W4kaADkAo4GKEVVPQN81EDUFCHJtqejQZ5dEG7pBC',
                  NumLinks: 1,
                  BlockSize: 64,
                  LinksSize: 53,
                  DataSize: 11,
                  CumulativeSize: 77
                }
                expect(expected).to.eql(stats)
                cb()
              })
            }
          ], done)
        })

        it('with multihash base58 encoded', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist()

            ipfs.object.stat(bs58.encode(node.multihash), { enc: 'base58' }, (err, stats) => {
              expect(err).to.not.exist()
              const expected = {
                Hash: 'QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ',
                NumLinks: 0,
                BlockSize: 17,
                LinksSize: 2,
                DataSize: 15,
                CumulativeSize: 17
              }
              expect(expected).to.deep.equal(stats)
              done()
            })
          })
        })

        it('with multihash base58 encoded toString', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist()

            ipfs.object.stat(bs58.encode(node.multihash).toString(), { enc: 'base58' }, (err, stats) => {
              expect(err).to.not.exist()
              const expected = {
                Hash: 'QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ',
                NumLinks: 0,
                BlockSize: 17,
                LinksSize: 2,
                DataSize: 15,
                CumulativeSize: 17
              }
              expect(expected).to.deep.equal(stats)
              done()
            })
          })
        })
      })

      describe('.patch', () => {
        let testNodeMultihash
        let testNodeWithLinkMultihash
        let testLink

        const obj = {
          Data: new Buffer('patch test object'),
          Links: []
        }

        before((done) => {
          ipfs.object.put(obj, (err, node) => {
            expect(err).to.not.exist()
            testNodeMultihash = node.multihash
            done()
          })
        })

        it('.addLink', (done) => {
          let node1a
          let node1b
          let node2

          series([
            (cb) => {
              DAGNode.create(obj.Data, obj.Links, (err, node) => {
                expect(err).to.not.exist()
                node1a = node
                cb()
              })
            },
            (cb) => {
              DAGNode.create(new Buffer('some other node'), (err, node) => {
                expect(err).to.not.exist()
                node2 = node
                cb()
              })
            },
            (cb) => {
              // note: we need to put the linked obj, otherwise IPFS won't
              // timeout. Reason: it needs the node to get its size
              ipfs.object.put(node2, cb)
            },
            (cb) => {
              const link = node2.toJSON()
              link.name = 'link-to-node'
              DAGNode.addLink(node1a, link, (err, node) => {
                expect(err).to.not.exist()
                node1b = node
                cb()
              })
            },
            (cb) => {
              ipfs.object.patch.addLink(testNodeMultihash, node1b.links[0], (err, node) => {
                expect(err).to.not.exist()
                expect(node1b.multihash).to.eql(node.multihash)
                testNodeWithLinkMultihash = node.multihash
                testLink = node1b.links[0]
                cb()
              })
            }
          ], done)
        })

        it('.rmLink', (done) => {
          ipfs.object.patch.rmLink(testNodeWithLinkMultihash, testLink, (err, node) => {
            expect(err).to.not.exist()
            expect(node.multihash).to.not.deep.equal(testNodeWithLinkMultihash)
            done()
          })
        })

        it('.appendData', (done) => {
          ipfs.object.patch.appendData(testNodeMultihash, new Buffer('append'), (err, node) => {
            expect(err).to.not.exist()
            expect(node.multihash).to.not.deep.equal(testNodeMultihash)
            done()
          })
        })

        it('.setData', (done) => {
          ipfs.object.patch.appendData(testNodeMultihash, new Buffer('set'), (err, node) => {
            expect(err).to.not.exist()
            expect(node.multihash).to.not.deep.equal(testNodeMultihash)
            done()
          })
        })
      })
    })

    describe('promise API', () => {
      it('object.new', (done) => {
        ipfs.object.new()
          .then((node) => {
            const nodeJSON = node.toJSON()
            expect(nodeJSON.multihash).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
            done()
          })
      })

      it('object.put', (done) => {
        const obj = {
          Data: new Buffer('Some data'),
          Links: []
        }

        ipfs.object.put(obj)
          .then((node) => {
            const nodeJSON = node.toJSON()
            expect(obj.Data).to.deep.equal(nodeJSON.data)
            expect(obj.Links).to.deep.equal(nodeJSON.links)
            expect(nodeJSON.multihash).to.equal('QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK')
            done()
          })
      })

      it('object.get', (done) => {
        const testObj = {
          Data: new Buffer('get test object'),
          Links: []
        }

        ipfs.object.put(testObj).then((node1) => {
          ipfs.object.get(node1.multihash).then((node2) => {
            // because js-ipfs-api can't infer if the
            // returned Data is Buffer or String
            if (typeof node2.data === 'string') {
              node2.data = new Buffer(node2.data)
            }

            expect(node1.data).to.deep.equal(node2.data)
            expect(node1.links).to.deep.equal(node2.links)
            done()
          })
        })
      })

      it('object.data', (done) => {
        const testObj = {
          Data: new Buffer('get test object'),
          Links: []
        }

        ipfs.object.put(testObj).then((node) => {
          ipfs.object.data(node.multihash).then((data) => {
            // because js-ipfs-api can't infer
            // if the returned Data is Buffer or String
            if (typeof data === 'string') {
              data = new Buffer(data)
            }
            expect(node.data).to.deep.equal(data)
            done()
          })
        })
      })

      it('object.stat', (done) => {
        const testObj = {
          Data: new Buffer('get test object'),
          Links: []
        }

        ipfs.object.put(testObj, (err, node) => {
          expect(err).to.not.exist()

          ipfs.object.stat('QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ', {enc: 'base58'})
            .then((stats) => {
              const expected = {
                Hash: 'QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ',
                NumLinks: 0,
                BlockSize: 17,
                LinksSize: 2,
                DataSize: 15,
                CumulativeSize: 17
              }
              expect(expected).to.deep.equal(stats)
              done()
            })
           .catch((err) => {
             expect(err).to.not.exist()
           })
        })
      })

      it('object.links', (done) => {
        const testObj = {
          Data: new Buffer('get test object'),
          Links: []
        }

        ipfs.object.put(testObj).then((node) => {
          ipfs.object.links(node.multihash).then((links) => {
            expect(node.links).to.eql(links)
            done()
          })
        })
      })

      describe('object.patch', () => {
        let testNodeMultihash
        let testNodeWithLinkMultihash
        let testLink

        const obj = {
          Data: new Buffer('patch test object'),
          Links: []
        }

        before((done) => {
          ipfs.object.put(obj, (err, node) => {
            expect(err).to.not.exist()
            testNodeMultihash = node.multihash
            done()
          })
        })

        it('.addLink', (done) => {
          let node1a
          let node1b
          let node2

          series([
            (cb) => {
              DAGNode.create(obj.Data, obj.Links, (err, node) => {
                expect(err).to.not.exist()
                node1a = node
                cb()
              })
            },
            (cb) => {
              DAGNode.create(new Buffer('some other node'), (err, node) => {
                expect(err).to.not.exist()
                node2 = node
                cb()
              })
            },
            (cb) => {
              // note: we need to put the linked obj, otherwise IPFS won't
              // timeout. Reason: it needs the node to get its size
              ipfs.object.put(node2, cb)
            },
            (cb) => {
              const link = node2.toJSON()
              link.name = 'link-to-node'
              DAGNode.addLink(node1a, link, (err, node) => {
                expect(err).to.not.exist()
                node1b = node
                cb()
              })
            },
            (cb) => {
              ipfs.object.patch.addLink(testNodeMultihash, node1b.links[0])
                .then((node) => {
                  expect(node1b.multihash).to.eql(node.multihash)
                  testNodeWithLinkMultihash = node.multihash
                  testLink = node1b.links[0]
                  cb()
                })
                .catch((err) => {
                  expect(err).to.not.exist()
                })
            }
          ], done)
        })

        it('.rmLink', (done) => {
          ipfs.object.patch.rmLink(testNodeWithLinkMultihash, testLink)
            .then((node) => {
              expect(node.multihash).to.not.deep.equal(testNodeWithLinkMultihash)
              done()
            })
            .catch((err) => {
              expect(err).to.not.exist()
            })
        })

        it('.appendData', (done) => {
          ipfs.object.patch.appendData(testNodeMultihash, new Buffer('append'))
            .then((node) => {
              expect(node.multihash).to.not.deep.equal(testNodeMultihash)
              done()
            })
            .catch((err) => {
              expect(err).to.not.exist()
            })
        })

        it('.setData', (done) => {
          ipfs.object.patch.appendData(testNodeMultihash, new Buffer('set'))
            .then((node) => {
              expect(node.multihash).to.not.deep.equal(testNodeMultihash)
              done()
            })
           .catch((err) => {
             expect(err).to.not.exist()
           })
        })
      })
    })
  })
}
