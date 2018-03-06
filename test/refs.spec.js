/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const isNode = require('detect-node')
const waterfall = require('async/waterfall')
const path = require('path')
const fs = require('fs')

const IPFSApi = require('../src')
const f = require('./utils/factory')

describe('.refs', function () {
  this.timeout(80 * 1000)

  if (!isNode) { return }

  let ipfs
  let ipfsd
  let folder

  before((done) => {
    const filesPath = path.join(__dirname, '/fixtures/test-folder')

    // Symlinks in a repo don't always clone well, especially on Windows.
    // So if the 'hello-link' is not a symlink, then make it one.
    const symlinkPath = filesPath + '/hello-link'
    const symlinkTarget = 'files/hello.txt'
    if (!fs.lstatSync(symlinkPath).isSymbolicLink()) {
      fs.unlinkSync(symlinkPath)
      fs.symlinkSync(symlinkTarget, symlinkPath)
    }

    waterfall([
      (cb) => f.spawn({ initOptions: { bits: 1024 } }, cb),
      (_ipfsd, cb) => {
        ipfsd = _ipfsd
        ipfs = IPFSApi(_ipfsd.apiAddr)
        ipfs.util.addFromFs(filesPath, { recursive: true }, cb)
      },
      (hashes, cb) => {
        folder = hashes[hashes.length - 1].hash
        expect(folder).to.be.eql('QmQao3KNcpCsdXaLGpjieFGMfXzsSXgsf6Rnc5dJJA3QMh')
        cb()
      }
    ], done)
  })

  after((done) => ipfsd.stop(done))

  const result = [
    {
      Ref: 'QmQao3KNcpCsdXaLGpjieFGMfXzsSXgsf6Rnc5dJJA3QMh QmcUYKmQxmTcFom4R4UZP7FWeQzgJkwcFn51XrvsMy7PE9 add',
      Err: ''
    }, {
      Ref: 'QmQao3KNcpCsdXaLGpjieFGMfXzsSXgsf6Rnc5dJJA3QMh QmNeHxDfQfjVFyYj2iruvysLH9zpp78v3cu1s3BZq1j5hY cat',
      Err: ''
    }, {
      Ref: 'QmQao3KNcpCsdXaLGpjieFGMfXzsSXgsf6Rnc5dJJA3QMh QmTYFLz5vsdMpq4XXw1a1pSxujJc9Z5V3Aw1Qg64d849Zy files',
      Err: ''
    }, {
      Ref: 'QmQao3KNcpCsdXaLGpjieFGMfXzsSXgsf6Rnc5dJJA3QMh QmY9cxiHqTFoWamkQVkpmmqzBrY3hCBEL2XNu3NtX74Fuu hello-link',
      Err: ''
    }, {
      Ref: 'QmQao3KNcpCsdXaLGpjieFGMfXzsSXgsf6Rnc5dJJA3QMh QmU7wetVaAqc3Meurif9hcYBHGvQmL5QdpPJYBoZizyTNL ipfs-add',
      Err: ''
    }, {
      Ref: 'QmQao3KNcpCsdXaLGpjieFGMfXzsSXgsf6Rnc5dJJA3QMh QmctZfSuegbi2TMFY2y3VQjxsH5JbRBu7XmiLfHNvshhio ls',
      Err: ''
    }, {
      Ref: 'QmQao3KNcpCsdXaLGpjieFGMfXzsSXgsf6Rnc5dJJA3QMh QmbkMNB6rwfYAxRvnG9CWJ6cKKHEdq2ZKTozyF5FQ7H8Rs version',
      Err: ''
    }
  ]

  describe('Callback API', () => {
    it('refs', (done) => {
      ipfs.refs(folder, { format: '<src> <dst> <linkname>' }, (err, objs) => {
        expect(err).to.not.exist()
        expect(objs).to.eql(result)
        done()
      })
    })
  })

  describe('Promise API', () => {
    it('refs', () => {
      return ipfs.refs(folder, { format: '<src> <dst> <linkname>' })
        .then((objs) => {
          expect(objs).to.eql(result)
        })
    })
  })
})
