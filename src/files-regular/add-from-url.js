/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const http = require('http')
const https = require('https')
const each = require('async/each')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.addFromURL', function () {
    this.timeout(40 * 1000)

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

    after((done) => common.teardown(done))

    let testServers = []

    const sslOpts = fixtures.sslOpts

    const startTestServer = (handler, opts, cb) => {
      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }

      const server = opts.secure
        ? https.createServer(sslOpts, handler)
        : http.createServer(handler)

      server.listen((err) => {
        if (err) return cb(err)
        testServers.push(server)
        cb(null, server)
      })
    }

    beforeEach(() => {
      // Instructs node to not reject our snake oil SSL certificate when it
      // can't verify the certificate authority
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
    })

    afterEach((done) => {
      // Reinstate unauthorised SSL cert rejection
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = 1

      each(testServers, (server, cb) => server.close(cb), (err) => {
        testServers = []
        done(err)
      })
    })

    it('should add from a HTTP URL', (done) => {
      const data = Buffer.from(`TEST${Date.now()}`)

      parallel({
        server: (cb) => {
          const handler = (req, res) => {
            res.write(data)
            res.end()
          }
          startTestServer(handler, cb)
        },
        expectedResult: (cb) => ipfs.add(data, cb)
      }, (err, taskResult) => {
        expect(err).to.not.exist()
        const { server, expectedResult } = taskResult

        const url = `http://127.0.0.1:${server.address().port}/`
        ipfs.addFromURL(url, (err, result) => {
          expect(err).to.not.exist()
          expect(result).to.deep.equal(expectedResult)
          done()
        })
      })
    })

    it('should add from a HTTPS URL', (done) => {
      const data = Buffer.from(`TEST${Date.now()}`)

      parallel({
        server: (cb) => {
          const handler = (req, res) => {
            res.write(data)
            res.end()
          }
          startTestServer(handler, { secure: true }, cb)
        },
        expectedResult: (cb) => ipfs.add(data, cb)
      }, (err, taskResult) => {
        expect(err).to.not.exist()
        const { server, expectedResult } = taskResult

        const url = `https://127.0.0.1:${server.address().port}/`
        ipfs.addFromURL(url, (err, result) => {
          expect(err).to.not.exist()
          expect(result).to.deep.equal(expectedResult)
          done()
        })
      })
    })

    it('should add from a HTTP URL with redirection', (done) => {
      const data = Buffer.from(`TEST${Date.now()}`)

      waterfall([
        (cb) => {
          const handler = (req, res) => {
            res.write(data)
            res.end()
          }
          startTestServer(handler, cb)
        },
        (serverA, cb) => {
          const url = `http://127.0.0.1:${serverA.address().port}`
          const handler = (req, res) => {
            res.statusCode = 302
            res.setHeader('Location', url)
            res.end()
          }
          startTestServer(handler, (err, serverB) => {
            if (err) return cb(err)
            cb(null, { a: serverA, b: serverB })
          })
        }
      ], (err, servers) => {
        expect(err).to.not.exist()

        ipfs.add(data, (err, res) => {
          expect(err).to.not.exist()

          const expectedHash = res[0].hash
          const url = `http://127.0.0.1:${servers.b.address().port}`

          ipfs.addFromURL(url, (err, result) => {
            expect(err).to.not.exist()
            expect(result[0].hash).to.equal(expectedHash)
            done()
          })
        })
      })
    })

    it('should add from a HTTPS URL with redirection', (done) => {
      const data = Buffer.from(`TEST${Date.now()}`)

      waterfall([
        (cb) => {
          const handler = (req, res) => {
            res.write(data)
            res.end()
          }
          startTestServer(handler, { secure: true }, cb)
        },
        (serverA, cb) => {
          const url = `https://127.0.0.1:${serverA.address().port}`
          const handler = (req, res) => {
            res.statusCode = 302
            res.setHeader('Location', url)
            res.end()
          }
          startTestServer(handler, { secure: true }, (err, serverB) => {
            if (err) return cb(err)
            cb(null, { a: serverA, b: serverB })
          })
        }
      ], (err, servers) => {
        expect(err).to.not.exist()

        ipfs.add(data, (err, res) => {
          expect(err).to.not.exist()

          const expectedHash = res[0].hash
          const url = `https://127.0.0.1:${servers.b.address().port}`

          ipfs.addFromURL(url, (err, result) => {
            expect(err).to.not.exist()
            expect(result[0].hash).to.equal(expectedHash)
            done()
          })
        })
      })
    })

    it('should add from a URL with only-hash=true', (done) => {
      const handler = (req, res) => {
        res.write(`TEST${Date.now()}`)
        res.end()
      }

      startTestServer(handler, (err, server) => {
        expect(err).to.not.exist()

        const url = `http://127.0.0.1:${server.address().port}/`

        ipfs.addFromURL(url, { onlyHash: true }, (err, res) => {
          expect(err).to.not.exist()

          // A successful object.get for this size data took my laptop ~14ms
          let didTimeout = false
          const timeoutId = setTimeout(() => {
            didTimeout = true
            done()
          }, 500)

          ipfs.object.get(res[0].hash, () => {
            clearTimeout(timeoutId)
            if (didTimeout) return
            expect(new Error('did not timeout')).to.not.exist()
          })
        })
      })
    })

    it('should add from a URL with wrap-with-directory=true', (done) => {
      const filename = `TEST${Date.now()}.txt`
      const data = Buffer.from(`TEST${Date.now()}`)

      parallel({
        server: (cb) => startTestServer((req, res) => {
          res.write(data)
          res.end()
        }, cb),
        expectedResult: (cb) => {
          ipfs.add([{ path: filename, content: data }], { wrapWithDirectory: true }, cb)
        }
      }, (err, taskResult) => {
        expect(err).to.not.exist()

        const { server, expectedResult } = taskResult
        const url = `http://127.0.0.1:${server.address().port}/${filename}?foo=bar#buzz`

        ipfs.addFromURL(url, { wrapWithDirectory: true }, (err, result) => {
          expect(err).to.not.exist()
          expect(result).to.deep.equal(expectedResult)
          done()
        })
      })
    })

    it('should add from a URL with wrap-with-directory=true and URL-escaped file name', (done) => {
      const filename = '320px-Domažlice,_Jiráskova_43_(9102).jpg'
      const data = Buffer.from(`TEST${Date.now()}`)

      parallel({
        server: (cb) => startTestServer((req, res) => {
          res.write(data)
          res.end()
        }, cb),
        expectedResult: (cb) => {
          ipfs.add([{ path: filename, content: data }], { wrapWithDirectory: true }, cb)
        }
      }, (err, taskResult) => {
        expect(err).to.not.exist()

        const { server, expectedResult } = taskResult
        const url = `http://127.0.0.1:${server.address().port}/${encodeURIComponent(filename)}?foo=bar#buzz`

        ipfs.addFromURL(url, { wrapWithDirectory: true }, (err, result) => {
          expect(err).to.not.exist()
          expect(result).to.deep.equal(expectedResult)
          done()
        })
      })
    })

    it('should not add from an invalid url', (done) => {
      ipfs.addFromURL('http://invalid', (err, result) => {
        expect(err.code).to.equal('ENOTFOUND')
        expect(result).to.not.exist()
        done()
      })
    })
  })
}
