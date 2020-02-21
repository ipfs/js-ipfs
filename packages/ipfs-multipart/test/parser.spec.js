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

const readDir = (path, prefix, includeMetadata, output = []) => {
  const entries = fs.readdirSync(path)

  entries.forEach(entry => {
    // resolves symlinks
    const entryPath = fs.realpathSync(`${path}/${entry}`)
    const type = fs.statSync(entryPath)

    if (type.isDirectory()) {
      readDir(entryPath, `${prefix}/${entry}`, includeMetadata, output)

      output.push({
        path: `${prefix}/${entry}`,
        mtime: includeMetadata ? new Date(type.mtimeMs) : undefined,
        mode: includeMetadata ? type.mode : undefined
      })
    }

    if (type.isFile()) {
      output.push({
        path: `${prefix}/${entry}`,
        content: fs.createReadStream(entryPath),
        mtime: includeMetadata ? new Date(type.mtimeMs) : undefined,
        mode: includeMetadata ? type.mode : undefined
      })
    }
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
    const fileMtime = parseInt(Date.now() / 1000)
    const fileMode = parseInt('0777', 8)

    before(() => {
      handler = async (req) => {
        expect(req.headers['content-type']).to.be.a('string')

        const files = []

        for await (const entry of parser(req)) {
          if (entry.type === 'file') {
            const file = { ...entry, content: '' }

            for await (const data of entry.content) {
              file.content += data.toString()
            }

            files.push(file)
          }
        }

        expect(files.length).to.equal(1)
        expect(JSON.parse(files[0].content)).to.deep.equal(JSON.parse(fileContent))
      }
    })

    it('parses ctl.config.replace correctly', async () => {
      await ctl.config.replace(JSON.parse(fileContent))
    })

    it('parses regular multipart requests correctly', (done) => {
      const formData = {
        file: fs.createReadStream(filePath)
      }

      request.post({ url: `http://localhost:${PORT}`, formData: formData }, (err) => done(err))
    })

    it('parses multipart requests with metadata correctly', (done) => {
      const formData = {
        file: {
          value: fileContent,
          options: {
            header: {
              mtime: fileMtime,
              mode: fileMode
            }
          }
        }
      }

      request.post({ url: `http://localhost:${PORT}`, formData }, (err) => done(err))
    })
  })

  describe('directory', () => {
    const dirPath = path.resolve(__dirname, 'fixtures')

    let files = []

    before(() => {
      handler = async (req) => {
        expect(req.headers['content-type']).to.be.a('string')

        for await (const entry of parser(req)) {
          const file = { ...entry, content: '' }

          if (entry.content) {
            for await (const data of entry.content) {
              file.content += data.toString()
            }
          }

          files.push(file)
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

      expect(files).to.have.lengthOf(contents.length)

      for (let i = 0; i < contents.length; i++) {
        expect(files[i].name).to.equal(contents[i].path)
        expect(files[i].mode).to.be.undefined
        expect(files[i].mtime).to.be.undefined
      }
    })

    it('parses ctl.add with metadata correctly', async () => {
      const contents = readDir(dirPath, 'fixtures', true)

      await ctl.add(contents, { recursive: true, followSymlinks: false })

      if (isWindows) {
        return
      }

      expect(files).to.have.lengthOf(contents.length)

      for (let i = 0; i < contents.length; i++) {
        const msecs = contents[i].mtime.getTime()
        const secs = Math.floor(msecs / 1000)

        expect(files[i].name).to.equal(contents[i].path)
        expect(files[i].mode).to.equal(contents[i].mode)
        expect(files[i].mtime).to.deep.equal({
          secs,
          nsecs: (msecs - (secs * 1000)) * 1000
        })
      }
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
