/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const DAGNode = require('ipfs-merkle-dag').DAGNode
const bs58 = require('bs58')

module.exports = (common) => {
  describe('.object', () => {
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
      describe('.new', () => {
        it('no layout', (done) => {
          ipfs.object.new((err, node) => {
            expect(err).to.not.exist
            expect(node.toJSON().Hash).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
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
            expect(err).to.not.exist
            const nodeJSON = node.toJSON()
            expect(obj.Data).to.deep.equal(nodeJSON.Data)
            expect(obj.Links).to.deep.equal(nodeJSON.Links)
            expect(nodeJSON.Hash).to.equal('QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK')
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
            expect(err).to.not.exist
            const nodeJSON = node.toJSON()

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

        it('of protobuf encoded buffer', (done) => {
          const dNode = new DAGNode(new Buffer('Some data'))
          const buf = dNode.marshal()

          ipfs.object.put(buf, { enc: 'protobuf' }, (err, node) => {
            expect(err).to.not.exist
            expect(dNode.data).to.deep.equal(node.data)
            expect(dNode.links).to.deep.equal(node.links)
            expect(dNode.multihash()).to.deep.equal(node.multihash())
            done()
          })
        })

        it('of buffer treated as Data field', (done) => {
          const data = new Buffer('Some data')
          ipfs.object.put(data, (err, node) => {
            expect(err).to.not.exist
            const nodeJSON = node.toJSON()
            expect(data).to.deep.equal(nodeJSON.Data)
            expect([]).to.deep.equal(nodeJSON.Links)
            expect(nodeJSON.Hash).to.equal('QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK')
            done()
          })
        })

        it('of DAGNode', (done) => {
          const dNode = new DAGNode(new Buffer('Some data'))

          ipfs.object.put(dNode, (err, node) => {
            expect(err).to.not.exist
            expect(dNode.data).to.deep.equal(node.data)
            expect(dNode.links).to.deep.equal(node.links)
            expect(dNode.multihash()).to.deep.equal(node.multihash())
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
          dNode1.addNodeLink('some-link', dNode2)

          ipfs.object.put(dNode1, (err, node) => {
            expect(err).to.not.exist
            expect(dNode1.data).to.deep.equal(node.data)
            expect(
              dNode1.links.map((l) => l.toJSON())
            ).to.deep.equal(
              node.links.map((l) => l.toJSON())
            )
            expect(dNode1.multihash()).to.deep.equal(node.multihash())
            done()
          })
        })
      })

      describe('.get', () => {
        it('with multihash', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node1) => {
            expect(err).to.not.exist

            ipfs.object.get(node1.multihash(), (err, node2) => {
              expect(err).to.not.exist
              // because js-ipfs-api can't infer if the returned Data is Buffer
              // or String
              if (typeof node2.data === 'string') {
                node2.data = new Buffer(node2.data)
              }
              expect(node1.multihash()).to.deep.equal(node2.multihash())
              expect(node1.data).to.deep.equal(node2.data)
              expect(node1.links).to.deep.equal(node2.links)
              done()
            })
          })
        })

        it('with multihash (+ links)', (done) => {
          const dNode1 = new DAGNode(new Buffer('Some data 1'))
          const dNode2 = new DAGNode(new Buffer('Some data 2'))
          dNode1.addNodeLink('some-link', dNode2)

          ipfs.object.put(dNode1, (err, node1) => {
            expect(err).to.not.exist

            ipfs.object.get(node1.multihash(), (err, node2) => {
              expect(err).to.not.exist
              // because js-ipfs-api can't infer if the returned Data is Buffer
              // or String
              if (typeof node2.data === 'string') {
                node2.data = new Buffer(node2.data)
              }
              expect(node1.multihash()).to.deep.equal(node2.multihash())
              expect(node1.data).to.deep.equal(node2.data)
              done()
            })
          })
        })

        it('with multihash base58 encoded', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node1) => {
            expect(err).to.not.exist

            ipfs.object.get(bs58.encode(node1.multihash()), { enc: 'base58' }, (err, node2) => {
              expect(err).to.not.exist
              // because js-ipfs-api can't infer if the returned Data is Buffer
              // or String
              if (typeof node2.data === 'string') {
                node2.data = new Buffer(node2.data)
              }
              expect(node1.multihash()).to.deep.equal(node2.multihash())
              expect(node1.data).to.deep.equal(node2.data)
              expect(node1.links).to.deep.equal(node2.links)
              done()
            })
          })
        })

        it('with multihash base58 encoded toString', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node1) => {
            expect(err).to.not.exist

            ipfs.object.get(bs58.encode(node1.multihash()).toString(), { enc: 'base58' }, (err, node2) => {
              expect(err).to.not.exist
              // because js-ipfs-api can't infer if the returned Data is Buffer
              // or String
              if (typeof node2.data === 'string') {
                node2.data = new Buffer(node2.data)
              }
              expect(node1.multihash()).to.deep.equal(node2.multihash())
              expect(node1.data).to.deep.equal(node2.data)
              expect(node1.links).to.deep.equal(node2.links)
              done()
            })
          })
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

            ipfs.object.data(node.multihash(), (err, data) => {
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

        it('with multihash base58 encoded', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist

            ipfs.object.data(bs58.encode(node.multihash()), { enc: 'base58' }, (err, data) => {
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

        it('with multihash base58 encoded toString', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist

            ipfs.object.data(bs58.encode(node.multihash()).toString(), { enc: 'base58' }, (err, data) => {
              expect(err).to.not.exist
              // because js-ipfs-api can't infer if the returned Data is Buffer
              // or String
              if (typeof data === 'string') {
                data = new Buffer(data)
              }
              expect(node.data).to.deep.equal(data)
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
            expect(err).to.not.exist

            ipfs.object.links(node.multihash(), (err, links) => {
              expect(err).to.not.exist
              expect(node.links).to.deep.equal(links)
              done()
            })
          })
        })

        it('with multihash (+ links)', (done) => {
          const dNode1 = new DAGNode(new Buffer('Some data 1'))
          const dNode2 = new DAGNode(new Buffer('Some data 2'))
          dNode1.addNodeLink('some-link', dNode2)

          ipfs.object.put(dNode1, (err, node) => {
            expect(err).to.not.exist

            ipfs.object.links(node.multihash(), (err, links) => {
              expect(err).to.not.exist
              expect(node.links[0].toJSON()).to.deep.equal(links[0].toJSON())
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
            expect(err).to.not.exist

            ipfs.object.links(bs58.encode(node.multihash()), { enc: 'base58' }, (err, links) => {
              expect(err).to.not.exist
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
            expect(err).to.not.exist

            ipfs.object.links(bs58.encode(node.multihash()).toString(), { enc: 'base58' }, (err, links) => {
              expect(err).to.not.exist
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
            expect(err).to.not.exist

            ipfs.object.stat(node.multihash(), (err, stats) => {
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

        it('with multihash (+ Links)', (done) => {
          const dNode1 = new DAGNode(new Buffer('Some data 1'))
          const dNode2 = new DAGNode(new Buffer('Some data 2'))
          dNode1.addNodeLink('some-link', dNode2)

          ipfs.object.put(dNode1, (err, node) => {
            expect(err).to.not.exist

            ipfs.object.stat(node.multihash(), (err, stats) => {
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

        it('with multihash base58 encoded', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist

            ipfs.object.stat(bs58.encode(node.multihash()), { enc: 'base58' }, (err, stats) => {
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

        it('with multihash base58 encoded toString', (done) => {
          const testObj = {
            Data: new Buffer('get test object'),
            Links: []
          }

          ipfs.object.put(testObj, (err, node) => {
            expect(err).to.not.exist

            ipfs.object.stat(bs58.encode(node.multihash()).toString(), { enc: 'base58' }, (err, stats) => {
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

      describe('.patch', () => {
        let testNode
        let testNodeWithLink
        let testLink
        before((done) => {
          const obj = {
            Data: new Buffer('patch test object'),
            Links: []
          }

          ipfs.object.put(obj, (err, node) => {
            expect(err).to.not.exist
            testNode = node
            done()
          })
        })

        it('.addLink', (done) => {
          const dNode1 = testNode.copy()
          const dNode2 = new DAGNode(new Buffer('some other node'))
          // note: we need to put the linked obj, otherwise IPFS won't timeout
          // cause it needs the node to get its size
          ipfs.object.put(dNode2, (err) => {
            expect(err).to.not.exist
            dNode1.addNodeLink('link-to-node', dNode2)

            ipfs.object.patch.addLink(testNode.multihash(), dNode1.links[0], (err, node3) => {
              expect(err).to.not.exist
              expect(dNode1.multihash()).to.deep.equal(node3.multihash())
              testNodeWithLink = node3
              testLink = dNode1.links[0]
              done()
            })
          })
        })

        it('.rmLink', (done) => {
          ipfs.object.patch.rmLink(testNodeWithLink.multihash(), testLink, (err, node) => {
            expect(err).to.not.exist
            expect(node.multihash()).to.deep.equal(testNode.multihash())
            done()
          })
        })

        it('.appendData', (done) => {
          ipfs.object.patch.appendData(testNode.multihash(), new Buffer('append'), (err, node) => {
            expect(err).to.not.exist
            expect(node.multihash()).to.not.deep.equal(testNode.multihash())
            done()
          })
        })

        it('.setData', (done) => {
          ipfs.object.patch.appendData(testNode.multihash(), new Buffer('set'), (err, node) => {
            expect(err).to.not.exist
            expect(node.multihash()).to.not.deep.equal(testNode.multihash())
            done()
          })
        })
      })
    })

    describe('promise API', () => {
      it('object.new', () => {
        return ipfs.object.new()
          .then((node) => {
            expect(node.toJSON().Hash).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
          })
      })

      it('object.put', () => {
        const obj = {
          Data: new Buffer('Some data'),
          Links: []
        }

        return ipfs.object.put(obj)
          .then((node) => {
            const nodeJSON = node.toJSON()
            expect(obj.Data).to.deep.equal(nodeJSON.Data)
            expect(obj.Links).to.deep.equal(nodeJSON.Links)
            expect(nodeJSON.Hash).to.equal('QmPb5f92FxKPYdT3QNBd1GKiL4tZUXUrzF4Hkpdr3Gf1gK')
          })
      })

      it('object.get', () => {
        const testObj = {
          Data: new Buffer('get test object'),
          Links: []
        }

        return ipfs.object.put(testObj)
          .then((node1) => {
            return ipfs.object.get(node1.multihash())
              .then((node2) => {
                // because js-ipfs-api can't infer if the returned Data is Buffer
                // or String
                if (typeof node2.data === 'string') {
                  node2.data = new Buffer(node2.data)
                }
                expect(node1.multihash()).to.deep.equal(node2.multihash())
                expect(node1.data).to.deep.equal(node2.data)
                expect(node1.links).to.deep.equal(node2.links)
              })
          })
      })

      it('object.data', () => {
        const testObj = {
          Data: new Buffer('get test object'),
          Links: []
        }

        return ipfs.object.put(testObj)
          .then((node) => {
            return ipfs.object.data(node.multihash())
              .then((data) => {
                // because js-ipfs-api can't infer
                // if the returned Data is Buffer or String
                if (typeof data === 'string') {
                  data = new Buffer(data)
                }
                expect(node.data).to.deep.equal(data)
              })
          })
      })

      it('object.stat', () => {
        const testObj = {
          Data: new Buffer('get test object'),
          Links: []
        }

        return ipfs.object.put(testObj)
          .then((node) => {
            return ipfs.object.stat(node.multihash())
          })
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

      it('object.links', () => {
        const testObj = {
          Data: new Buffer('get test object'),
          Links: []
        }

        return ipfs.object.put(testObj)
          .then((node) => {
            return ipfs.object.links(node.multihash())
              .then((links) => {
                expect(node.links).to.deep.equal(links)
              })
          })
      })

      describe('object.patch', () => {
        let testNode
        let testNodeWithLink
        let testLink

        before(() => {
          const obj = {
            Data: new Buffer('patch test object'),
            Links: []
          }

          return ipfs.object.put(obj)
            .then((node) => {
              testNode = node
            })
        })

        it('.addLink', () => {
          const dNode1 = testNode.copy()
          const dNode2 = new DAGNode(new Buffer('some other node'))
          // note: we need to put the linked obj, otherwise IPFS won't timeout
          // cause it needs the node to get its size
          return ipfs.object.put(dNode2)
            .then(() => {
              dNode1.addNodeLink('link-to-node', dNode2)

              return ipfs.object.patch
                .addLink(testNode.multihash(), dNode1.links[0])
                .then((node3) => {
                  expect(dNode1.multihash()).to.deep.equal(node3.multihash())
                  testNodeWithLink = node3
                  testLink = dNode1.links[0]
                })
            })
        })

        it('.rmLink', () => {
          return ipfs.object.patch
            .rmLink(testNodeWithLink.multihash(), testLink)
            .then((node) => {
              expect(node.multihash()).to.deep.equal(testNode.multihash())
            })
        })

        it('.appendData', () => {
          return ipfs.object.patch
            .appendData(testNode.multihash(), new Buffer('append'))
            .then((node) => {
              expect(node.multihash()).to.not.deep.equal(testNode.multihash())
            })
        })

        it('.setData', () => {
          return ipfs.object.patch
            .appendData(testNode.multihash(), new Buffer('set'))
            .then((node) => {
              expect(node.multihash()).to.not.deep.equal(testNode.multihash())
            })
        })
      })
    })
  })
}
