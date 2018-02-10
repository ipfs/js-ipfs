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
  describe('.object', function () {
    this.timeout(80 * 1000)

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
            Data: Buffer.from('Some data'),
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
            Data: Buffer.from('Some data'),
            Links: []
          }

          const obj2 = {
            Data: obj.Data.toString(),
            Links: obj.Links
          }

          const buf = Buffer.from(JSON.stringify(obj2))

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
              DAGNode.create(Buffer.from('Some data'), (err, _node) => {
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
          const data = Buffer.from('Some data')
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
          DAGNode.create(Buffer.from('Some data'), (err, dNode) => {
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
              DAGNode.create(Buffer.from('Some data 1'), (err, node) => {
                expect(err).to.not.exist()
                node1a = node
                cb()
              })
            },
            (cb) => {
              DAGNode.create(Buffer.from('Some data 2'), (err, node) => {
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
            Data: Buffer.from('get test object'),
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
                  node2.data = Buffer.from(node2.data)
                }
                cb()
              })
            },
            (cb) => {
              // get object from ipfs multihash string
              ipfs.object.get(node1.toJSON().multihash, (err, node) => {
                expect(err).to.not.exist()
                expect(node).to.exist()
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
              DAGNode.create(Buffer.from('Some data 1'), (err, node) => {
                expect(err).to.not.exist()
                node1a = node
                cb()
              })
            },
            (cb) => {
              DAGNode.create(Buffer.from('Some data 2'), (err, node) => {
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
                  node.data = Buffer.from(node.data)
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
            Data: Buffer.from('get test object'),
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
                  node.data = Buffer.from(node.data)
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
            Data: Buffer.from('get test object'),
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
                  node.data = Buffer.from(node.data)
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
            Data: Buffer.from('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist()

            ipfs.object.data(node.multihash, (err, data) => {
              expect(err).to.not.exist()

              // because js-ipfs-api can't infer
              // if the returned Data is Buffer or String
              if (typeof data === 'string') {
                data = Buffer.from(data)
              }
              expect(node.data).to.eql(data)
              done()
            })
          })
        })

        it('with multihash base58 encoded', (done) => {
          const testObj = {
            Data: Buffer.from('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist()

            ipfs.object.data(bs58.encode(node.multihash), { enc: 'base58' }, (err, data) => {
              expect(err).to.not.exist()

              // because js-ipfs-api can't infer
              // if the returned Data is Buffer or String
              if (typeof data === 'string') {
                data = Buffer.from(data)
              }
              expect(node.data).to.eql(data)
              done()
            })
          })
        })

        it('with multihash base58 encoded toString', (done) => {
          const testObj = {
            Data: Buffer.from('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist()

            ipfs.object.data(bs58.encode(node.multihash).toString(), { enc: 'base58' }, (err, data) => {
              expect(err).to.not.exist()

              // because js-ipfs-api can't infer if the
              // returned Data is Buffer or String
              if (typeof data === 'string') {
                data = Buffer.from(data)
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
            Data: Buffer.from('get test object'),
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
              DAGNode.create(Buffer.from('Some data 1'), (err, node) => {
                expect(err).to.not.exist()
                node1a = node
                cb()
              })
            },
            (cb) => {
              DAGNode.create(Buffer.from('Some data 2'), (err, node) => {
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
            Data: Buffer.from('get test object'),
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
            Data: Buffer.from('get test object'),
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
            Data: Buffer.from('get test object'),
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
              DAGNode.create(Buffer.from('Some data 1'), (err, node) => {
                expect(err).to.not.exist()
                node1a = node
                cb()
              })
            },
            (cb) => {
              DAGNode.create(Buffer.from('Some data 2'), (err, node) => {
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
            Data: Buffer.from('get test object'),
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
            Data: Buffer.from('get test object'),
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
        let testLinkPlainObject

        const obj = {
          Data: Buffer.from('patch test object'),
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
          let node3

          series([
            (cb) => {
              DAGNode.create(obj.Data, obj.Links, (err, node) => {
                expect(err).to.not.exist()
                node1a = node
                cb()
              })
            },
            (cb) => {
              DAGNode.create(Buffer.from('some other node'), (err, node) => {
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
            },
            (cb) => {
              // note: make sure we can link js plain objects
              const content = Buffer.from(JSON.stringify({
                title: 'serialized object',
              }, null, 0));
              ipfs.add(content, (err, result) => {
                expect(err).to.not.exist()
                expect(result).to.exist()
                expect(result).to.have.lengthOf(1)
                const object = result.pop()
                node3 = {
                  name: object.hash,
                  multihash: object.hash,
                  size: object.size
                }
                cb()
              })
            },
            (cb) => {
              ipfs.object.patch.addLink(testNodeWithLinkMultihash, node3, (err, node) => {
                expect(err).to.not.exist()
                expect(node).to.exist()
                testNodeWithLinkMultihash = node.multihash
                testLinkPlainObject = node3
                cb()
              })
            },
          ], done)
        })

        it('.rmLink', (done) => {
          series([
            (cb) => {
              ipfs.object.patch.rmLink(testNodeWithLinkMultihash, testLink, (err, node) => {
                expect(err).to.not.exist()
                expect(node.multihash).to.not.deep.equal(testNodeWithLinkMultihash)
                testNodeWithLinkMultihash = node.multihash

                cb()
              })
            },
            (cb) => {
              ipfs.object.patch.rmLink(testNodeWithLinkMultihash, testLinkPlainObject, (err, node) => {
                expect(err).to.not.exist()
                expect(node.multihash).to.not.deep.equal(testNodeWithLinkMultihash)
                console.log('node', node)
                cb()
              })
            }
          ], done)
        })

        it('.appendData', (done) => {
          ipfs.object.patch.appendData(testNodeMultihash, Buffer.from('append'), (err, node) => {
            expect(err).to.not.exist()
            expect(node.multihash).to.not.deep.equal(testNodeMultihash)
            done()
          })
        })

        it('.setData', (done) => {
          ipfs.object.patch.appendData(testNodeMultihash, Buffer.from('set'), (err, node) => {
            expect(err).to.not.exist()
            expect(node.multihash).to.not.deep.equal(testNodeMultihash)
            done()
          })
        })
      })
    })

    describe('promise API', () => {
      it('object.new', () => {
        return ipfs.object.new()
          .then((node) => {
            const nodeJSON = node.toJSON()
            expect(nodeJSON.multihash).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
          })
      })

      it('object.put', () => {
        const obj = {
          Data: Buffer.from('Some data'),
          Links: []
        }

        return ipfs.object.put(obj)
          .then((node) => {
            const nodeJSON = node.toJSON()
            expect(obj.Data).to.deep.equal(nodeJSON.data)
            expect(obj.Links).to.deep.equal(nodeJSON.links)
            expect(nodeJSON.multihash).to.equal('QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK')
          })
      })

      it('object.get', () => {
        const testObj = {
          Data: Buffer.from('get test object'),
          Links: []
        }

        return ipfs.object.put(testObj).then((node1) => {
          return ipfs.object.get(node1.multihash).then((node2) => {
            // because js-ipfs-api can't infer if the
            // returned Data is Buffer or String
            if (typeof node2.data === 'string') {
              node2.data = Buffer.from(node2.data)
            }

            expect(node1.data).to.deep.equal(node2.data)
            expect(node1.links).to.deep.equal(node2.links)
          })
        })
      })

      it('object.get multihash string', () => {
        return ipfs.object.get('QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK').then((node) => {
          expect(node.data).to.exist()
        })
      })

      it('object.data', () => {
        const testObj = {
          Data: Buffer.from('get test object'),
          Links: []
        }

        return ipfs.object.put(testObj).then((node) => {
          return ipfs.object.data(node.multihash).then((data) => {
            // because js-ipfs-api can't infer
            // if the returned Data is Buffer or String
            if (typeof data === 'string') {
              data = Buffer.from(data)
            }
            expect(node.data).to.deep.equal(data)
          })
        })
      })

      it('object.stat', () => {
        const testObj = {
          Data: Buffer.from('get test object'),
          Links: []
        }

        return ipfs.object.put(testObj, (err, node) => {
          expect(err).to.not.exist()

          return ipfs.object.stat('QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ', {enc: 'base58'})
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
            })
        })
      })

      it('object.links', () => {
        const testObj = {
          Data: Buffer.from('get test object'),
          Links: []
        }

        return ipfs.object.put(testObj).then((node) => {
          return ipfs.object.links(node.multihash).then((links) => {
            expect(node.links).to.eql(links)
          })
        })
      })

      describe('object.patch', () => {
        let testNodeMultihash
        let testNodeWithLinkMultihash
        let testLink

        const obj = {
          Data: Buffer.from('patch test object'),
          Links: []
        }

        before(() => {
          return ipfs.object.put(obj, (err, node) => {
            expect(err).to.not.exist()
            testNodeMultihash = node.multihash
          })
        })

        it('.addLink', () => {
          let node1a
          let node1b
          let node2
          return new Promise((resolve, reject) => {
            DAGNode.create(obj.Data, obj.Links, function (err, node) {
              if (err) {
                return reject(err)
              }
              return resolve(node)
            })
          }).then((node) => {
            node1a = node
            return new Promise((resolve, reject) => {
              DAGNode.create(Buffer.from('some other node'), function (err, node) {
                if (err) {
                  return reject(err)
                }
                return resolve(node)
              })
            }).then((node1) => {
              node2 = node1
              return ipfs.object.put(node2)
            })
          }).then(() => {
            const link = node2.toJSON()
            link.name = 'link-to-node'
            return new Promise((resolve, reject) => {
              DAGNode.addLink(node1a, link, function (err, node) {
                if (err) {
                  return reject(err)
                }
                return resolve(node)
              })
            }).then((node) => {
              node1b = node
              return ipfs.object.patch.addLink(testNodeMultihash, node1b.links[0])
            })
          }).then((node) => {
            expect(node1b.multihash).to.eql(node.multihash)
            testNodeWithLinkMultihash = node.multihash
            testLink = node1b.links[0]
          })
        })

        it('.rmLink', () => {
          return ipfs.object.patch.rmLink(testNodeWithLinkMultihash, testLink)
            .then((node) => {
              expect(node.multihash).to.not.deep.equal(testNodeWithLinkMultihash)
            })
        })

        it('.appendData', () => {
          return ipfs.object.patch.appendData(testNodeMultihash, Buffer.from('append'))
            .then((node) => {
              expect(node.multihash).to.not.deep.equal(testNodeMultihash)
            })
        })

        it('.setData', () => {
          return ipfs.object.patch.appendData(testNodeMultihash, Buffer.from('set'))
            .then((node) => {
              expect(node.multihash).to.not.deep.equal(testNodeMultihash)
            })
        })
      })
    })
  })
}
