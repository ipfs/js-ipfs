/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const bl = require('bl')
const parallel = require('async/parallel')
const Buffer = require('safe-buffer')
const IPFSFactory = require('../utils/ipfs-factory-instance')

describe('verify that kad-dht is doing its thing', () => {
  let factory
  let nodeA
  let nodeB
  let nodeC
  // let addrA
  let addrB
  let addrC

  before((done) => {
    factory = new IPFSFactory()
    parallel([
      (cb) => factory.spawnNode(cb),
      (cb) => factory.spawnNode(cb),
      (cb) => factory.spawnNode(cb)
    ], (err, nodes) => {
      expect(err).to.not.exist()
      nodeA = nodes[0]
      nodeB = nodes[1]
      nodeC = nodes[2]
      parallel([
        (cb) => nodeA.id(cb),
        (cb) => nodeB.id(cb),
        (cb) => nodeC.id(cb)
      ], (err, ids) => {
        expect(err).to.not.exist()
        // addrA = ids[0].addresses[0]
        addrB = ids[1].addresses[0]
        addrC = ids[2].addresses[0]
        parallel([
          (cb) => nodeA.swarm.connect(addrB, cb),
          (cb) => nodeB.swarm.connect(addrC, cb)
        ], done)
      })
    })
  })

  after((done) => factory.dismantle(done))

  it('add a file in C, fetch through B in A', (done) => {
    const file = {
      path: 'testfile.txt',
      content: Buffer.from('hello kad')
    }

    nodeC.files.add(file, (err, res) => {
      expect(err).to.not.exist()
      nodeA.files.cat(res[0].hash, (err, stream) => {
        expect(err).to.not.exist()
        stream.pipe(bl((err, data) => {
          expect(err).to.not.exist()
          console.log(data.toString())
          expect(data).to.eql(new Buffer('hello kad'))
          done()
        }))
      })
    })
  })
})
