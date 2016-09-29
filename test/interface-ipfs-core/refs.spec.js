/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const waterfall = require('async/waterfall')
const path = require('path')
const FactoryClient = require('../factory/factory-client')

describe('.refs', () => {
  if (!isNode) {
    return
  }

  let ipfs
  let fc
  let folder

  before(function (done) {
    this.timeout(20 * 1000) // slow CI
    fc = new FactoryClient()
    waterfall([
      (cb) => fc.spawnNode(cb),
      (node, cb) => {
        ipfs = node
        const filesPath = path.join(__dirname, '../data/test-folder')
        ipfs.util.addFromFs(filesPath, { recursive: true }, cb)
      },
      (hashes, cb) => {
        folder = hashes[hashes.length - 1].hash
        cb()
      }
    ], done)
  })

  after((done) => {
    fc.dismantle(done)
  })

  const result = [{
    Ref: 'QmRNjDeKStKGTQXnJ2NFqeQ9oW23WcpbmvCVrpDHgDg3T6 QmcUYKmQxmTcFom4R4UZP7FWeQzgJkwcFn51XrvsMy7PE9 add.js',
    Err: ''
  }, {
    Ref: 'QmRNjDeKStKGTQXnJ2NFqeQ9oW23WcpbmvCVrpDHgDg3T6 QmNeHxDfQfjVFyYj2iruvysLH9zpp78v3cu1s3BZq1j5hY cat.js',
    Err: ''
  }, {
    Ref: 'QmRNjDeKStKGTQXnJ2NFqeQ9oW23WcpbmvCVrpDHgDg3T6 QmTYFLz5vsdMpq4XXw1a1pSxujJc9Z5V3Aw1Qg64d849Zy files',
    Err: ''
  }, {
    Ref: 'QmRNjDeKStKGTQXnJ2NFqeQ9oW23WcpbmvCVrpDHgDg3T6 QmY9cxiHqTFoWamkQVkpmmqzBrY3hCBEL2XNu3NtX74Fuu hello-link',
    Err: ''
  }, {
    Ref: 'QmRNjDeKStKGTQXnJ2NFqeQ9oW23WcpbmvCVrpDHgDg3T6 QmU7wetVaAqc3Meurif9hcYBHGvQmL5QdpPJYBoZizyTNL ipfs-add.js',
    Err: ''
  }, {
    Ref: 'QmRNjDeKStKGTQXnJ2NFqeQ9oW23WcpbmvCVrpDHgDg3T6 QmctZfSuegbi2TMFY2y3VQjxsH5JbRBu7XmiLfHNvshhio ls.js',
    Err: ''
  }, {
    Ref: 'QmRNjDeKStKGTQXnJ2NFqeQ9oW23WcpbmvCVrpDHgDg3T6 QmbkMNB6rwfYAxRvnG9CWJ6cKKHEdq2ZKTozyF5FQ7H8Rs version.js',
    Err: ''
  }]

  it('refs', (done) => {
    ipfs.refs(folder, {format: '<src> <dst> <linkname>'}, (err, objs) => {
      expect(err).to.not.exist
      expect(objs).to.eql(result)

      done()
    })
  })

  describe('promise', () => {
    it('refs', () => {
      return ipfs.refs(folder, {format: '<src> <dst> <linkname>'})
        .then((objs) => {
          expect(objs).to.eql(result)
        })
    })
  })
})
