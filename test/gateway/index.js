/* eslint-env mocha */
'use strict'

const fs = require('fs')
const path = require('path')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const API = require('../../src/http')
const loadFixture = require('aegir/fixtures')
const bigFile = loadFixture(__dirname, '../../node_modules/interface-ipfs-core/test/fixtures/15mb.random', 'ipfs')
const directoryContent = {
  'index.html': loadFixture(__dirname, './test-folder/index.html', 'ipfs'),
  'nested-folder/hello.txt': loadFixture(__dirname, './test-folder/nested-folder/hello.txt', 'ipfs'),
  'nested-folder/ipfs.txt': loadFixture(__dirname, './test-folder/nested-folder/ipfs.txt', 'ipfs'),
  'nested-folder/nested.html': loadFixture(__dirname, './test-folder/nested-folder/nested.html', 'ipfs')
}

describe('HTTP Gateway', () => {
  let http = {}
  let gateway

  before((done) => {
    http.api = new API()

    http.api.start(true, () => {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: directoryContent[name]
      })

      const emptyDir = (name) => ({
        path: `test-folder/${name}`
      })

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
        gateway = http.api.server.select('Gateway')
        done()
      })
    })
  })

  after((done) => {
    http.api.stop((err) => {
      expect(err).to.not.exist()
      done()
    })
  })

  describe('## interface tests', () => {
    fs.readdirSync(path.join(__dirname, '/interface'))
      .forEach((file) => require('./interface/' + file))
  })

  describe('## HTTP Gateway', () => {
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
        expect(res.rawPayload).to.deep.equal(Buffer.from('hello world' + '\n'))
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
        expect(res.rawPayload).to.deep.equal(bigFile)
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
})
