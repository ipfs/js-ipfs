/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const APIctl = require('ipfs-api')
const http = require('http')
const path = require('path')
const fs = require('fs')
const request = require('request')
const IPFSMultipart = require('..')

describe('parser', () => {
  const PORT = 6001

  let ctl
  let handler = (req, cb) => cb()

  before((done) => {
    http.createServer((req, res) => {
      if (req.method === 'POST' && req.headers['content-type']) {
        return handler(req, () => {
          res.writeHead(200)
          res.end()
        })
      }

      res.writeHead(404)
      res.end()
    }).listen(PORT, () => {
      ctl = APIctl(`/ip4/127.0.0.1/tcp/${PORT}`)
      done()
    })
  })

  describe('single file', () => {
    const filePath = path.resolve(__dirname, 'fixtures/config')
    const fileContent = fs.readFileSync(filePath, 'utf8')

    before(() => {
      handler = (req, cb) => {
        expect(req.headers['content-type']).to.be.a('string')
        const parser = IPFSMultipart.reqParser(req)

        const files = []

        parser.on('file', (fileName, fileStream) => {
          const file = { fileName: fileName, content: '' }
          fileStream.on('data', (data) => {
            file.content = data.toString()
          })
          fileStream.on('end', (data) => {
            files.push(file)
          })
        })

        parser.on('end', () => {
          expect(files.length).to.equal(1)
          expect(files[0].fileName).to.contain('config')
          expect(files[0].content).to.equal(fileContent)
          cb()
        })
      }
    })

    it('parses ctl.config.replace correctly', (done) => {
      ctl.config.replace(filePath, (err, res) => {
        expect(err).not.to.exist
        done()
      })
    })

    it('parses regular multipart requests correctly', (done) => {
      const formData = {
        file: fs.createReadStream(filePath)
      }

      request.post({ url: `http://localhost:${PORT}`, formData: formData }, (err, httpResponse, body) => {
        expect(err).not.to.exist
        done()
      })
    })
  })

  describe('directory', () => {
    const dirPath = path.resolve(__dirname, 'fixtures')

    let files = []
    let symlinks = []

    before(() => {
      handler = (req, cb) => {
        expect(req.headers['content-type']).to.be.a('string')
        const parser = IPFSMultipart.reqParser(req)

        parser.on('file', (fileName, fileStream) => {
          const file = { fileName: fileName, content: '' }
          fileStream.on('data', (data) => {
            file.content = data.toString()
          })
          fileStream.on('end', (data) => {
            files.push(file)
          })
        })

        parser.on('symlink', (fileName, target) => {
          symlinks.push({ fileName: fileName, target: target })
        })

        parser.on('end', cb)
      }
    })

    beforeEach(() => {
      files = []
      symlinks = []
    })

    it('parses ctl.add correctly', (done) => {
      ctl.add(dirPath, { recursive: true, followSymlinks: false }, (err, res) => {
        expect(err).to.not.exist

        expect(files.length).to.equal(3)
        expect(files[0].fileName).to.equal('fixtures/config')
        expect(files[1].fileName).to.equal('fixtures/otherfile')
        expect(files[2].fileName).to.equal('fixtures/subfolder/deepfile')

        expect(symlinks.length).to.equal(2)
        expect(symlinks[0].fileName).to.equal('fixtures/folderlink')
        expect(symlinks[1].fileName).to.equal('fixtures/link')
        expect(symlinks[0].target).to.equal('subfolder')
        expect(symlinks[1].target).to.equal('subfolder/deepfile')

        done()
      })
    })

    it('parses ctl.add following symlinks correctly', (done) => {
      ctl.add(dirPath, { recursive: true }, (err, res) => {
        expect(err).to.not.exist

        expect(files.length).to.equal(5)
        expect(symlinks.length).to.equal(0)

        done()
      })
    })
  })

  describe('empty', () => {
    before(() => {
      handler = (req, cb) => {
        expect(req.headers['content-type']).to.be.a('string')
        const parser = IPFSMultipart.reqParser(req)

        parser.on('end', cb)
      }
    })

    it('does not block', (done) => {
      request.post({ url: `http://localhost:${PORT}` }, (err, httpResponse, body) => {
        expect(err).not.to.exist
        done()
      })
    })
  })

  describe('buffer', () => {
    let files = []

    before(() => {
      handler = (req, cb) => {
        expect(req.headers['content-type']).to.be.a('string')
        const parser = IPFSMultipart.reqParser(req)

        parser.on('file', (fileName, fileStream) => {
          const file = { fileName: fileName, content: '' }
          fileStream.on('data', (data) => {
            file.content = data.toString()
          })
          fileStream.on('end', (data) => {
            files.push(file)
          })
        })

        parser.on('end', cb)
      }
    })

    it('parses ctl.add buffer correctly', (done) => {
      ctl.add(new Buffer('hello world'), (err, res) => {
        expect(err).to.not.exist

        expect(files.length).to.equal(1)
        expect(files[0].fileName).to.equal('')
        expect(files[0].content).to.equal('hello world')

        done()
      })
    })
  })
})
