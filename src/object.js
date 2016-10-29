/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const expect = require('chai').expect
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
        expect(err).to.not.exist
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist
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
            expect(err).to.not.exist
            node.toJSON((err, obj) => {
              expect(err).to.not.exist
              expect(obj.Hash).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
              done()
            })
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
            expect(err).to.not.exist
            node.toJSON((err, nodeJSON) => {
              expect(err).to.not.exist
              expect(obj.Data).to.deep.equal(nodeJSON.Data)
              expect(obj.Links).to.deep.equal(nodeJSON.Links)
              expect(nodeJSON.Hash).to.equal('QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK')
              done()
            })
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
            expect(err).to.not.exist
            node.toJSON((err, nodeJSON) => {
              expect(err).to.not.exist

              // because js-ipfs-api can't
              // infer if the returned Data is Buffer or String
              if (typeof node.data === 'string') {
                node.data = new Buffer(node.data)
              }

              expect(obj.Data).to.deep.equal(node.data)
              expect(obj.Links).to.deep.equal(nodeJSON.Links)
              expect(nodeJSON.Hash).to.equal('QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK')
              done()
            })
          })
        })

        it('of protobuf encoded buffer', (done) => {
          const node = new DAGNode(new Buffer('Some data'))
          let serialized
          let multihash

          series([
            (cb) => {
              node.multihash((err, _multihash) => {
                expect(err).to.not.exist
                multihash = _multihash
                cb()
              })
            },
            (cb) => {
              dagPB.util.serialize(node, (err, _serialized) => {
                expect(err).to.not.exist
                serialized = _serialized
                cb()
              })
            },
            (cb) => {
              ipfs.object.put(serialized, { enc: 'protobuf' }, (err, storedNode) => {
                expect(err).to.not.exist
                expect(node.data).to.deep.equal(node.data)
                expect(node.links).to.deep.equal(node.links)
                storedNode.multihash((err, _multihash) => {
                  expect(err).to.not.exist
                  expect(multihash).to.eql(_multihash)
                  cb()
                })
              })
            }
          ], done)
        })

        it('of buffer treated as Data field', (done) => {
          const data = new Buffer('Some data')
          ipfs.object.put(data, (err, node) => {
            expect(err).to.not.exist
            node.toJSON((err, nodeJSON) => {
              expect(err).to.not.exist
              expect(data).to.deep.equal(nodeJSON.Data)
              expect([]).to.deep.equal(nodeJSON.Links)
              expect(nodeJSON.Hash).to.equal('QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK')
              done()
            })
          })
        })

        it('of DAGNode', (done) => {
          const dNode = new DAGNode(new Buffer('Some data'))

          ipfs.object.put(dNode, (err, node) => {
            expect(err).to.not.exist
            expect(dNode.data).to.deep.equal(node.data)
            expect(dNode.links).to.deep.equal(node.links)
            done()
          })
        })

        it('fails if String is passed', (done) => {
          ipfs.object.put('aaa', (err) => {
            expect(err).to.exist
            done()
          })
        })

        it('DAGNode with some DAGLinks', (done) => {
          const dNode1 = new DAGNode(new Buffer('Some data 1'))
          const dNode2 = new DAGNode(new Buffer('Some data 2'))
          dNode1.addNodeLink('some-link', dNode2, (err) => {
            expect(err).to.not.exist
            ipfs.object.put(dNode1, (err, node) => {
              expect(err).to.not.exist
              expect(dNode1.data).to.deep.equal(node.data)
              expect(
                dNode1.links.map((l) => l.toJSON())
              ).to.deep.equal(
                node.links.map((l) => l.toJSON())
              )
              done()
            })
          })
        })
      })

      describe('.get', () => {
        it('with multihash', (done) => {
          const obj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          let node1
          let node1Multihash
          let node2

          series([
            (cb) => {
              ipfs.object.put(obj, (err, node) => {
                expect(err).to.not.exist
                node1 = node
                cb()
              })
            },
            (cb) => {
              node1.multihash((err, multihash) => {
                expect(err).to.not.exist
                node1Multihash = multihash
                cb()
              })
            },
            (cb) => {
              ipfs.object.get(node1Multihash, (err, node) => {
                expect(err).to.not.exist
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
              expect(node1.data).to.deep.equal(node2.data)
              expect(node1.links).to.deep.equal(node2.links)
              node2.multihash((err, multihash) => {
                expect(err).to.not.exist
                expect(node1Multihash).to.deep.equal(multihash)
                cb()
              })
            }
          ], done)
        })

        it('with multihash (+ links)', (done) => {
          const node1 = new DAGNode(new Buffer('Some data 1'))
          const node2 = new DAGNode(new Buffer('Some data 2'))
          let node1Multihash
          let node1Retrieved

          series([
            (cb) => {
              node1.addNodeLink('some-link', node2, cb)
            },
            (cb) => {
              ipfs.object.put(node1, (err, node) => {
                expect(err).to.not.exist
                cb()
              })
            },
            (cb) => {
              node1.multihash((err, multihash) => {
                expect(err).to.not.exist
                node1Multihash = multihash
                cb()
              })
            },
            (cb) => {
              ipfs.object.get(node1Multihash, (err, node) => {
                expect(err).to.not.exist
                node1Retrieved = node
                // because js-ipfs-api can't infer if the
                // returned Data is Buffer or String
                if (typeof node1Retrieved.data === 'string') {
                  node1Retrieved.data = new Buffer(node1Retrieved.data)
                }
                cb()
              })
            },
            (cb) => {
              expect(node1.data).to.deep.equal(node1Retrieved.data)
              node1Retrieved.multihash((err, multihash) => {
                expect(err).to.not.exist
                expect(node1Multihash).to.deep.equal(multihash)
                cb()
              })
            }
          ], done)
        })

        it('with multihash base58 encoded', (done) => {
          const obj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          let node1a
          let node1Multihash
          let node1b

          series([
            (cb) => {
              ipfs.object.put(obj, (err, node) => {
                expect(err).to.not.exist
                node1a = node
                cb()
              })
            },
            (cb) => {
              node1a.multihash((err, multihash) => {
                expect(err).to.not.exist
                node1Multihash = multihash
                cb()
              })
            },
            (cb) => {
              ipfs.object.get(node1Multihash, { enc: 'base58' }, (err, node) => {
                expect(err).to.not.exist
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
              node1b.multihash((err, multihash) => {
                expect(err).to.not.exist
                expect(node1Multihash).to.eql(multihash)
                expect(node1a.data).to.eql(node1b.data)
                expect(node1a.links).to.eql(node1b.links)
                cb()
              })
            }
          ], done)
        })

        it('with multihash base58 encoded toString', (done) => {
          const obj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          let node1a
          let node1Multihash
          let node1b

          series([
            (cb) => {
              ipfs.object.put(obj, (err, node) => {
                expect(err).to.not.exist
                node1a = node
                cb()
              })
            },
            (cb) => {
              node1a.multihash((err, multihash) => {
                expect(err).to.not.exist
                node1Multihash = multihash
                cb()
              })
            },
            (cb) => {
              ipfs.object.get(bs58.encode(node1Multihash).toString(), { enc: 'base58' }, (err, node) => {
                expect(err).to.not.exist
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
              node1b.multihash((err, multihash) => {
                expect(err).to.not.exist
                expect(node1Multihash).to.eql(multihash)
                expect(node1a.data).to.eql(node1b.data)
                expect(node1a.links).to.eql(node1b.links)
                cb()
              })
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
            expect(err).to.not.exist

            node.multihash((err, multihash) => {
              expect(err).to.not.exist
              ipfs.object.data(multihash, (err, data) => {
                expect(err).to.not.exist

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
        })

        it('with multihash base58 encoded', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist

            node.multihash((err, multihash) => {
              expect(err).to.not.exist

              ipfs.object.data(bs58.encode(multihash), { enc: 'base58' }, (err, data) => {
                expect(err).to.not.exist

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
        })

        it('with multihash base58 encoded toString', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist

            node.multihash((err, multihash) => {
              expect(err).to.not.exist

              ipfs.object.data(bs58.encode(multihash).toString(), { enc: 'base58' }, (err, data) => {
                expect(err).to.not.exist

                // because js-ipfs-api can't infer if the
                // returned Data is Buffer or String
                if (typeof data === 'string') {
                  data = new Buffer(data)
                }
                expect(node.data).to.deep.equal(data)
                done()
              })
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
            expect(err).to.not.exist
            node.multihash((err, multihash) => {
              expect(err).to.not.exist

              ipfs.object.links(multihash, (err, links) => {
                expect(err).to.not.exist
                expect(node.links).to.deep.equal(links)
                done()
              })
            })
          })
        })

        it('with multihash (+ links)', (done) => {
          const node1 = new DAGNode(new Buffer('Some data 1'))
          const node2 = new DAGNode(new Buffer('Some data 2'))

          node1.addNodeLink('some-link', node2, (err) => {
            expect(err).to.not.exist

            ipfs.object.put(node1, (err, node) => {
              expect(err).to.not.exist
              node.multihash((err, multihash) => {
                expect(err).to.not.exist

                ipfs.object.links(multihash, (err, links) => {
                  expect(err).to.not.exist
                  expect(node.links[0].toJSON()).to.deep.equal(links[0].toJSON())
                  done()
                })
              })
            })
          })
        })

        it('with multihash base58 encoded', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist
            node.multihash((err, multihash) => {
              expect(err).to.not.exist

              ipfs.object.links(bs58.encode(multihash), { enc: 'base58' }, (err, links) => {
                expect(err).to.not.exist
                expect(node.links).to.deep.equal(links)
                done()
              })
            })
          })
        })

        it('with multihash base58 encoded toString', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist
            node.multihash((err, multihash) => {
              expect(err).to.not.exist

              ipfs.object.links(bs58.encode(multihash), { enc: 'base58' }, (err, links) => {
                expect(err).to.not.exist
                expect(node.links).to.deep.equal(links)
                done()
              })
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
            expect(err).to.not.exist

            node.multihash((err, multihash) => {
              expect(err).to.not.exist

              ipfs.object.stat(multihash, (err, stats) => {
                expect(err).to.not.exist
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

        it('with multihash (+ Links)', (done) => {
          const node1 = new DAGNode(new Buffer('Some data 1'))
          const node2 = new DAGNode(new Buffer('Some data 2'))
          node1.addNodeLink('some-link', node2, (err) => {
            expect(err).to.not.exist

            ipfs.object.put(node1, (err, node) => {
              expect(err).to.not.exist
              node.multihash((err, multihash) => {
                expect(err).to.not.exist
                ipfs.object.stat(multihash, (err, stats) => {
                  expect(err).to.not.exist
                  const expected = {
                    Hash: 'QmPR7W4kaADkAo4GKEVVPQN81EDUFCHJtqejQZ5dEG7pBC',
                    NumLinks: 1,
                    BlockSize: 64,
                    LinksSize: 53,
                    DataSize: 11,
                    CumulativeSize: 77
                  }
                  expect(expected).to.deep.equal(stats)
                  done()
                })
              })
            })
          })
        })

        it('with multihash base58 encoded', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist

            node.multihash((err, multihash) => {
              expect(err).to.not.exist

              ipfs.object.stat(bs58.encode(multihash), { enc: 'base58' }, (err, stats) => {
                expect(err).to.not.exist
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

        it('with multihash base58 encoded toString', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist

            node.multihash((err, multihash) => {
              expect(err).to.not.exist

              ipfs.object.stat(bs58.encode(multihash).toString(), { enc: 'base58' }, (err, stats) => {
                expect(err).to.not.exist
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
            expect(err).to.not.exist
            node.multihash((err, multihash) => {
              expect(err).to.not.exist
              testNodeMultihash = multihash
              done()
            })
          })
        })

        it('.addLink', (done) => {
          const node1 = new DAGNode(obj.Data, obj.Links)
          const node2 = new DAGNode(new Buffer('some other node'))
          let node1Multihash

          series([
            (cb) => {
              // note: we need to put the linked obj, otherwise IPFS won't
              // timeout. Reason: it needs the node to get its size
              ipfs.object.put(node2, cb)
            },
            (cb) => {
              node1.addNodeLink('link-to-node', node2, cb)
            },
            (cb) => {
              node1.multihash((err, multihash) => {
                expect(err).to.not.exist
                node1Multihash = multihash
                cb()
              })
            },
            (cb) => {
              ipfs.object.patch.addLink(testNodeMultihash, node1.links[0], (err, node) => {
                expect(err).to.not.exist
                node.multihash((err, multihash) => {
                  expect(err).to.not.exist
                  expect(node1Multihash).to.eql(multihash)
                  testNodeWithLinkMultihash = multihash
                  testLink = node1.links[0]
                  cb()
                })
              })
            }
          ], done)
        })

        it('.rmLink', (done) => {
          ipfs.object.patch.rmLink(testNodeWithLinkMultihash, testLink, (err, node) => {
            expect(err).to.not.exist
            node.multihash((err, multihash) => {
              expect(err).to.not.exist
              expect(multihash).to.not.deep.equal(testNodeWithLinkMultihash)
              done()
            })
          })
        })

        it('.appendData', (done) => {
          ipfs.object.patch.appendData(testNodeMultihash, new Buffer('append'), (err, node) => {
            expect(err).to.not.exist
            node.multihash((err, multihash) => {
              expect(err).to.not.exist
              expect(multihash).to.not.deep.equal(testNodeMultihash)
              done()
            })
          })
        })

        it('.setData', (done) => {
          ipfs.object.patch.appendData(testNodeMultihash, new Buffer('set'), (err, node) => {
            expect(err).to.not.exist
            node.multihash((err, multihash) => {
              expect(err).to.not.exist
              expect(multihash).to.not.deep.equal(testNodeMultihash)
              done()
            })
          })
        })
      })
    })

    describe('promise API', () => {
      it('object.new', (done) => {
        ipfs.object.new()
          .then((node) => {
            node.toJSON((err, nodeJSON) => {
              expect(err).to.not.exist
              expect(nodeJSON.Hash).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
              done()
            })
          })
      })

      it('object.put', (done) => {
        const obj = {
          Data: new Buffer('Some data'),
          Links: []
        }

        ipfs.object.put(obj)
          .then((node) => {
            node.toJSON((err, nodeJSON) => {
              expect(err).to.not.exist
              expect(obj.Data).to.deep.equal(nodeJSON.Data)
              expect(obj.Links).to.deep.equal(nodeJSON.Links)
              expect(nodeJSON.Hash).to.equal('QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK')
              done()
            })
          })
      })

      it('object.get', (done) => {
        const testObj = {
          Data: new Buffer('get test object'),
          Links: []
        }

        ipfs.object.put(testObj)
          .then((node1) => {
            node1.multihash((err, multihash) => {
              expect(err).to.not.exist
              ipfs.object.get(multihash)
                .then((node2) => {
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
      })

      it('object.data', (done) => {
        const testObj = {
          Data: new Buffer('get test object'),
          Links: []
        }

        ipfs.object.put(testObj)
          .then((node) => {
            node.multihash((err, multihash) => {
              expect(err).to.not.exist
              ipfs.object.data(multihash)
                .then((data) => {
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
      })

      it('object.stat', (done) => {
        const testObj = {
          Data: new Buffer('get test object'),
          Links: []
        }

        ipfs.object.put(testObj, (err, node) => {
          expect(err).to.not.exist

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
             expect(err).to.not.exist
           })
        })
      })

      it('object.links', (done) => {
        const testObj = {
          Data: new Buffer('get test object'),
          Links: []
        }

        ipfs.object.put(testObj)
          .then((node) => {
            node.multihash((err, multihash) => {
              expect(err).to.not.exist
              ipfs.object.links(multihash)
                .then((links) => {
                  expect(node.links).to.deep.equal(links)
                  done()
                })
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
            expect(err).to.not.exist
            node.multihash((err, multihash) => {
              expect(err).to.not.exist
              testNodeMultihash = multihash
              done()
            })
          })
        })

        it('.addLink', (done) => {
          const node1 = new DAGNode(obj.Data, obj.Links)
          const node2 = new DAGNode(new Buffer('some other node'))
          let node1Multihash

          series([
            (cb) => {
              // note: we need to put the linked obj, otherwise IPFS won't
              // timeout. Reason: it needs the node to get its size
              ipfs.object.put(node2, cb)
            },
            (cb) => {
              node1.addNodeLink('link-to-node', node2, cb)
            },
            (cb) => {
              node1.multihash((err, multihash) => {
                expect(err).to.not.exist
                node1Multihash = multihash
                cb()
              })
            },
            (cb) => {
              ipfs.object.patch.addLink(testNodeMultihash, node1.links[0])
                .then((node) => {
                  node.multihash((err, multihash) => {
                    expect(err).to.not.exist
                    expect(node1Multihash).to.eql(multihash)
                    testNodeWithLinkMultihash = multihash
                    testLink = node1.links[0]
                    cb()
                  })
                })
                .catch((err) => {
                  expect(err).to.not.exist
                })
            }
          ], done)
        })

        it('.rmLink', (done) => {
          ipfs.object.patch.rmLink(testNodeWithLinkMultihash, testLink)
            .then((node) => {
              node.multihash((err, multihash) => {
                expect(err).to.not.exist
                expect(multihash).to.not.deep.equal(testNodeWithLinkMultihash)
                done()
              })
            })
            .catch((err) => {
              expect(err).to.not.exist
            })
        })

        it('.appendData', (done) => {
          ipfs.object.patch.appendData(testNodeMultihash, new Buffer('append'))
            .then((node) => {
              node.multihash((err, multihash) => {
                expect(err).to.not.exist
                expect(multihash).to.not.deep.equal(testNodeMultihash)
                done()
              })
            })
            .catch((err) => {
              expect(err).to.not.exist
            })
        })

        it('.setData', (done) => {
          ipfs.object.patch.appendData(testNodeMultihash, new Buffer('set'))
            .then((node) => {
              node.multihash((err, multihash) => {
                expect(err).to.not.exist
                expect(multihash).to.not.deep.equal(testNodeMultihash)
                done()
              })
            })
           .catch((err) => {
             expect(err).to.not.exist
           })
        })
      })
    })
  })
}
