/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const series = require('async/series')
const API = require('../../src/http')
const loadFixture = require('aegir/fixtures')
const os = require('os')
const path = require('path')
const hat = require('hat')
const fileType = require('file-type')

const bigFile = loadFixture('js/test/fixtures/15mb.random', 'interface-ipfs-core')
const directoryContent = {
  'index.html': loadFixture('test/gateway/test-folder/index.html'),
  'nested-folder/hello.txt': loadFixture('test/gateway/test-folder/nested-folder/hello.txt'),
  'nested-folder/ipfs.txt': loadFixture('test/gateway/test-folder/nested-folder/ipfs.txt'),
  'nested-folder/nested.html': loadFixture('test/gateway/test-folder/nested-folder/nested.html'),
  'cat-folder/cat.jpg': loadFixture('test/gateway/test-folder/cat-folder/cat.jpg')
}

describe('HTTP Gateway', function () {
  this.timeout(80 * 1000)

  let http = {}
  let gateway

  before(function (done) {
    this.timeout(60 * 1000)
    const repoPath = path.join(os.tmpdir(), '/ipfs-' + hat())

    http.api = new API(repoPath, {
      Addresses: {
        Swarm: ['/ip4/127.0.0.1/tcp/0'],
        API: '/ip4/127.0.0.1/tcp/0',
        Gateway: '/ip4/127.0.0.1/tcp/0'
      },
      Bootstrap: [],
      Discovery: {
        MDNS: {
          Enabled: false
        }
      }
    })

    const content = (name) => ({
      path: `test-folder/${name}`,
      content: directoryContent[name]
    })

    const emptyDir = (name) => ({ path: `test-folder/${name}` })

    series([
      (cb) => http.api.start(true, cb),
      (cb) => {
        gateway = http.api.server.select('Gateway')
        const expectedRootMultihash = 'QmbQD7EMEL1zeebwBsWEfA3ndgSS6F7S6iTuwuqasPgVRi'

        const dirs = [
          content('index.html'),
          emptyDir('empty-folder'),
          content('nested-folder/hello.txt'),
          content('nested-folder/ipfs.txt'),
          content('nested-folder/nested.html'),
          emptyDir('nested-folder/empty')
        ]

        http.api.node.files.add(dirs, (err, res) => {
          expect(err).to.not.exist()
          const root = res[res.length - 1]

          expect(root.path).to.equal('test-folder')
          expect(root.hash).to.equal(expectedRootMultihash)
          cb()
        })
      },
      (cb) => {
        const expectedMultihash = 'Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq'

        http.api.node.files.add(bigFile, (err, res) => {
          expect(err).to.not.exist()
          const file = res[0]
          expect(file.path).to.equal(expectedMultihash)
          expect(file.hash).to.equal(expectedMultihash)
          cb()
        })
      },
      (cb) => {
        const expectedMultihash = 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'

        http.api.node.files.add(Buffer.from('hello world' + '\n'), (err, res) => {
          expect(err).to.not.exist()
          const file = res[0]
          expect(file.path).to.equal(expectedMultihash)
          expect(file.hash).to.equal(expectedMultihash)
          cb()
        })
      },
      (cb) => {
        const expectedMultihash = 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ'

        let dir = [
          content('cat-folder/cat.jpg')
        ]

        http.api.node.files.add(dir, (err, res) => {
          expect(err).to.not.exist()
          const file = res[1]
          expect(file.path).to.equal('test-folder/cat-folder')
          expect(file.hash).to.equal(expectedMultihash)
          cb()
        })
      }
    ], done)
  })

  after((done) => http.api.stop(done))

  it('returns 400 for request without argument', (done) => {
    gateway.inject({
      method: 'GET',
      url: '/ipfs'
    }, (res) => {
      expect(res.statusCode).to.equal(400)
      expect(res.result.Message).to.be.a('string')
      done()
    })
  })

  it('400 for request with invalid argument', (done) => {
    gateway.inject({
      method: 'GET',
      url: '/ipfs/invalid'
    }, (res) => {
      expect(res.statusCode).to.equal(400)
      expect(res.result.Message).to.be.a('string')
      done()
    })
  })

  it('valid hash', (done) => {
    gateway.inject({
      method: 'GET',
      url: '/ipfs/QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
    }, (res) => {
      expect(res.statusCode).to.equal(200)
      expect(res.rawPayload).to.eql(Buffer.from('hello world' + '\n'))
      expect(res.payload).to.equal('hello world' + '\n')
      done()
    })
  })

  it('stream a large file', (done) => {
    let bigFileHash = 'Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq'

    gateway.inject({
      method: 'GET',
      url: '/ipfs/' + bigFileHash
    }, (res) => {
      expect(res.statusCode).to.equal(200)
      expect(res.rawPayload).to.eql(bigFile)
      done()
    })
  })

  it('load a non text file', (done) => {
    let kitty = 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ/cat.jpg'

    gateway.inject({
      method: 'GET',
      url: '/ipfs/' + kitty
    }, (res) => {
      expect(res.statusCode).to.equal(200)
      expect(res.headers['content-type']).to.equal('image/jpeg')

      let fileSignature = fileType(res.rawPayload)
      expect(fileSignature.mime).to.equal('image/jpeg')
      expect(fileSignature.ext).to.equal('jpg')

      done()
    })
  })

  it('load a directory', (done) => {
    let dir = 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ/'

    gateway.inject({
      method: 'GET',
      url: '/ipfs/' + dir
    }, (res) => {
      expect(res.statusCode).to.equal(200)
      expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')

      // check if the cat picture is in the payload as a way to check
      // if this is an index of this directory
      let listedFile = res.payload.match(/\/ipfs\/QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ\/cat\.jpg/g)
      expect(listedFile).to.have.lengthOf(1)
      done()
    })
  })

  it('load a webpage index.html', (done) => {
    let dir = 'QmbQD7EMEL1zeebwBsWEfA3ndgSS6F7S6iTuwuqasPgVRi/index.html'

    gateway.inject({
      method: 'GET',
      url: '/ipfs/' + dir
    }, (res) => {
      expect(res.statusCode).to.equal(200)
      expect(res.rawPayload).to.deep.equal(directoryContent['index.html'])
      done()
    })
  })

  it('load a webpage {hash}/nested-folder/nested.html', (done) => {
    let dir = 'QmbQD7EMEL1zeebwBsWEfA3ndgSS6F7S6iTuwuqasPgVRi/nested-folder/nested.html'

    gateway.inject({
      method: 'GET',
      url: '/ipfs/' + dir
    }, (res) => {
      expect(res.statusCode).to.equal(200)
      expect(res.rawPayload).to.deep.equal(directoryContent['nested-folder/nested.html'])
      done()
    })
  })

  it('redirect to generated index', (done) => {
    let dir = 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ'

    gateway.inject({
      method: 'GET',
      url: '/ipfs/' + dir
    }, (res) => {
      expect(res.statusCode).to.equal(301)
      expect(res.headers['location']).to.equal('/ipfs/QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ/')
      done()
    })
  })

  it('redirect to webpage index.html', (done) => {
    let dir = 'QmbQD7EMEL1zeebwBsWEfA3ndgSS6F7S6iTuwuqasPgVRi/'

    gateway.inject({
      method: 'GET',
      url: '/ipfs/' + dir
    }, (res) => {
      expect(res.statusCode).to.equal(302)
      expect(res.headers['location']).to.equal('/ipfs/QmbQD7EMEL1zeebwBsWEfA3ndgSS6F7S6iTuwuqasPgVRi/index.html')
      done()
    })
  })
})
