'use strict'

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const expect = require('chai').expect
const APIctl = require('ipfs-http-client')
const http = require('http')
const path = require('path')
const fs = require('fs')
const request = require('request')
const parser = require('../src')
const os = require('os')

const isWindows = os.platform() === 'win32'

const readDir = (path, prefix, output = []) => {
  const entries = fs.readdirSync(path)

  entries.forEach(entry => {
    // resolves symlinks
    const entryPath = fs.realpathSync(`${path}/${entry}`)
    const type = fs.statSync(entryPath)

    if (type.isDirectory()) {
      readDir(entryPath, `${prefix}/${entry}`, output)
    }

    if (type.isFile()) {
      output.push({
        path: `${prefix}/${entry}`,
        content: fs.createReadStream(entryPath)
      })
    }
  })

  output.push({
    path: prefix
  })

  return output
}

describe('parser', () => {
  const PORT = 6001

  let ctl
  let handler = () => {}

  before((done) => {
    http.createServer((req, res) => {
      if (req.method === 'POST' && req.headers['content-type']) {
        handler(req)
          .then(() => {
            res.writeHead(200)
          })
          .catch(() => {
            res.writeHead(500)
          })
          .then(() => {
            res.end()
          })

        return
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
      handler = async (req) => {
        expect(req.headers['content-type']).to.be.a('string')

        const files = []

        for await (const entry of parser(req)) {
          if (entry.type === 'file') {
            const file = { name: entry.name, content: '' }

            for await (const data of entry.content) {
              file.content += data.toString()
            }

            files.push(file)
          }
        }

        expect(files.length).to.equal(1)
        expect(files[0].name).to.equal('config')
        expect(files[0].content).to.equal(fileContent)
      }
    })

    it('parses ctl.config.replace correctly', async () => {
      await ctl.config.replace(filePath)
    })

    it('parses regular multipart requests correctly', (done) => {
      const formData = {
        file: fs.createReadStream(filePath)
      }

      request.post({ url: `http://localhost:${PORT}`, formData: formData }, (err) => done(err))
    })
  })

  describe('directory', () => {
    const dirPath = path.resolve(__dirname, 'fixtures')

    let files = []

    before(() => {
      handler = async (req) => {
        expect(req.headers['content-type']).to.be.a('string')

        for await (const entry of parser(req)) {
          if (entry.type === 'file') {
            const file = { name: entry.name, content: '' }

            for await (const data of entry.content) {
              file.content += data.toString()
            }

            files.push(file)
          }
        }
      }
    })

    beforeEach(() => {
      files = []
    })

    it('parses ctl.add correctly', async () => {
      const contents = readDir(dirPath, 'fixtures')

      await ctl.add(contents, { recursive: true, followSymlinks: false })

      if (isWindows) {
        return
      }

      expect(files.length).to.equal(5)
      expect(files[0].name).to.equal('fixtures/config')
      expect(files[1].name).to.equal('fixtures/folderlink/deepfile')
      expect(files[2].name).to.equal('fixtures/link')
      expect(files[3].name).to.equal('fixtures/otherfile')
      expect(files[4].name).to.equal('fixtures/subfolder/deepfile')
    })
  })

  describe('empty', () => {
    before(() => {
      handler = async (req) => {
        expect(req.headers['content-type']).to.be.a('string')

        for await (const _ of parser(req)) { // eslint-disable-line no-unused-vars

        }
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
    const files = []

    before(() => {
      handler = async (req) => {
        expect(req.headers['content-type']).to.be.a('string')

        for await (const entry of parser(req)) {
          if (entry.type === 'file') {
            const file = { name: entry.name, content: '' }

            for await (const data of entry.content) {
              file.content += data.toString()
            }

            files.push(file)
          }
        }
      }
    })

    it('parses ctl.add buffer correctly', async () => {
      await ctl.add(Buffer.from('hello world'))

      expect(files.length).to.equal(1)
      expect(files[0].name).to.equal('')
      expect(files[0].content).to.equal('hello world')
    })
  })
})
