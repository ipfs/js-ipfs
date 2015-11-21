'use strict'

/* global describe it before */

const ipfsAPI = require('../src/index.js')
const streamEqual = require('stream-equal')
const assert = require('assert')
const path = require('path')
const File = require('vinyl')
const Readable = require('stream').Readable

const isNode = !global.window

const testfilePath = __dirname + '/testfile.txt'
let testfile
let testfileBig

if (isNode) {
  testfile = require('fs').readFileSync(__dirname + '/testfile.txt')
  testfileBig = require('fs').createReadStream(__dirname + '/15mb.random', { bufferSize: 128 })
  // testfileBig = require('fs').createReadStream(__dirname + '/100mb.random', { bufferSize: 128 })
} else {
  testfile = require('raw!./testfile.txt')
  // browser goes nuts with a 100mb in memory
  // testfileBig = require('raw!./100mb.random')
}

describe('IPFS Node.js API wrapper tests', () => {
  const apiClients = {} // a, b, c
  const apiAddrs = require('./tmp-disposable-nodes-addrs.json')

  before(function (done) {
    this.timeout(20000)

    Object.keys(apiAddrs).forEach(key => {
      apiClients[key] = ipfsAPI(apiAddrs[key])
    })

    done()
  })

  it('connect Node a to b and c', function (done) {
    this.timeout(5000)

    const addrs = {}
    let counter = 0
    collectAddr('b', finish)
    collectAddr('c', finish)

    function finish () {
      counter++
      if (counter === 2) {
        dial()
      }
    }

    function collectAddr (key, cb) {
      apiClients[key].id((err, id) => {
        if (err) {
          throw err
        }
        // note to self: HTTP API port !== Node port
        addrs[key] = id.Addresses[0]
        cb()
      })
    }

    function dial () {
      apiClients['a'].swarm.connect(addrs['b'], (err, res) => {
        if (err) {
          throw err
        }
        apiClients['a'].swarm.connect(addrs['c'], err => {
          if (err) {
            throw err
          }
          done()
        })
      })
    }
  })

  it('has the api object', () => {
    assert(apiClients['a'])
    assert(apiClients['a'].id)
  })

  describe('.send', () => {
    it('used by every command')
  })

  describe('.add', function () {
    it('add file', function (done) {
      if (!isNode) {
        return done()
      }

      this.timeout(10000)

      const file = new File({
        cwd: path.dirname(testfilePath),
        base: path.dirname(testfilePath),
        path: testfilePath,
        contents: new Buffer(testfile)
      })

      apiClients['a'].add(file, (err, res) => {
        if (err) throw err

        const added = res[0] != null ? res[0] : res
        assert.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        assert.equal(added.Name, path.basename(testfilePath))
        done()
      })
    })

    it('add buffer', function (done) {
      this.timeout(10000)

      let buf = new Buffer(testfile)
      apiClients['a'].add(buf, (err, res) => {
        if (err) throw err

        // assert.equal(res.length, 1)
        const added = res[0] !== null ? res[0] : res
        assert.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        done()
      })
    })

    it('add BIG buffer', function (done) {
      if (!isNode) {
        return done()
      }
      this.timeout(10000)

      apiClients['a'].add(testfileBig, (err, res) => {
        if (err) throw err

        // assert.equal(res.length, 1)
        const added = res[0] !== null ? res[0] : res
        assert.equal(added.Hash, 'Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq')
        done()
      })
    })

    it('add path', function (done) {
      if (!isNode) {
        return done()
      }

      this.timeout(10000)

      apiClients['a'].add(testfilePath, (err, res) => {
        if (err) throw err

        const added = res[0] != null ? res[0] : res
        assert.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        done()
      })
    })

    it('add a nested dir', function (done) {
      this.timeout(10000)

      apiClients['a'].add(__dirname + '/test-folder', { recursive: true }, (err, res) => {
        if (isNode) {
          if (err) throw err

          const added = res[res.length - 1]
          assert.equal(added.Hash, 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg')
          done()
        } else {
          assert.equal(err.message, 'Recursive uploads are not supported in the browser')
          done()
        }
      })
    })

    it('add stream', function (done) {
      this.timeout(10000)

      const stream = new Readable()
      stream.push('Hello world')
      stream.push(null)
      apiClients['a'].add(stream, (err, res) => {
        if (err) throw err

        const added = res[0] != null ? res[0] : res
        assert.equal(added.Hash, 'QmNRCQWfgze6AbBCaT1rkrkV5tJ2aP4oTNPb5JZcXYywve')
        done()
      })
    })

    it('add url', function (done) {
      this.timeout(10000)

      const url = 'https://raw.githubusercontent.com/ipfs/js-ipfs-api/2a9cc63d7427353f2145af6b1a768a69e67c0588/README.md'
      apiClients['a'].add(url, (err, res) => {
        if (err) throw err

        const added = res[0] != null ? res[0] : res
        assert.equal(added.Hash, 'QmZmHgEX9baxUn3qMjsEXQzG6DyNcrVnwieQQTrpDdrFvt')
        done()
      })
    })
  })

  describe('.cat', function () {
    it('cat', function (done) {
      this.timeout(10000)

      apiClients['a'].cat('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
        if (err) {
          throw err
        }

        let buf = ''
        res
          .on('error', err => { throw err })
          .on('data', data => buf += data)
          .on('end', () => {
            assert.equal(buf, testfile)
            done()
          })
      })
    })

    it('cat BIG file', function (done) {
      if (!isNode) {
        return done()
      }
      this.timeout(60000)

      apiClients['a'].cat('Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq', (err, res) => {
        if (err) {
          throw err
        }
        
        // Do not blow out the memory of nodejs :)
        streamEqual(res, testfileBig, (err, equal) => {
          console.log('compare done', err, equal)
          if (err) throw err
          assert(equal)
          done()
        })
      })
    })
  })

  describe('.ls', function () {
    const folder = 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg'
    it('ls', function (done) {
      if (!isNode) {
        return done()
      }

      this.timeout(100000)

      apiClients['a'].ls(folder, (err, res) => {
        if (err) {
          throw err
        }

        const objs = {
          Hash: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg',
          Links: [{
            Name: 'add.js',
            Hash: 'QmcUYKmQxmTcFom4R4UZP7FWeQzgJkwcFn51XrvsMy7PE9',
            Size: 487,
            Type: 2
          }, {
            Name: 'cat.js',
            Hash: 'QmNeHxDfQfjVFyYj2iruvysLH9zpp78v3cu1s3BZq1j5hY',
            Size: 368,
            Type: 2
          }, {
            Name: 'files',
            Hash: 'QmTYFLz5vsdMpq4XXw1a1pSxujJc9Z5V3Aw1Qg64d849Zy',
            Size: 132,
            Type: 1
          }, {
            Name: 'ipfs-add.js',
            Hash: 'QmU7wetVaAqc3Meurif9hcYBHGvQmL5QdpPJYBoZizyTNL',
            Size: 333,
            Type: 2
          }, {
            Name: 'ls.js',
            Hash: 'QmctZfSuegbi2TMFY2y3VQjxsH5JbRBu7XmiLfHNvshhio',
            Size: 432,
            Type: 2
          }, {
            Hash: 'QmTDH2RXGn8XyDAo9YyfbZAUXwL1FCr44YJCN9HBZmL9Gj',
            Name: 'test-folder',
            Size: 2212,
            Type: 1
          }, {
            Name: 'version.js',
            Hash: 'QmbkMNB6rwfYAxRvnG9CWJ6cKKHEdq2ZKTozyF5FQ7H8Rs',
            Size: 155,
            Type: 2 }]
        }

        assert.deepEqual(res.Objects[0], objs)
        done()
      })
    })
  })

  describe('.config', function () {
    it('.config.{set, get}', function (done) {
      this.timeout(10000)

      const confKey = 'arbitraryKey'
      const confVal = 'arbitraryVal'

      apiClients['a'].config.set(confKey, confVal, (err, res) => {
        if (err) throw err
        apiClients['a'].config.get(confKey, (err, res) => {
          if (err) throw err
          assert.equal(res.Value, confVal)
          done()
        })
      })
    })

    it('.config.show', function (done) {
      this.timeout(10000)

      apiClients['c'].config.show((err, res) => {
        if (err) {
          throw err
        }

        assert(res)
        done()
      })
    })

    it('.config.replace', function (done) {
      this.timeout(10000)

      if (!isNode) {
        return done()
      }

      apiClients['c'].config.replace(__dirname + '/r-config.json', (err, res) => {
        if (err) {
          throw err
        }

        assert.equal(res, null)
        done()
      })
    })
  })

  describe('.update (currently disabled, wait for IPFS 0.4.0 release', () => {
    it('.update.apply')
    it('.update.check')
    it('.update.log')
  })

  describe('.version', function () {
    it('checks the version', function (done) {
      this.timeout(10000)
      apiClients['a'].version((err, res) => {
        if (err) {
          throw err
        }
        assert(res)
        assert(res.Version)
        console.log('      - running against version', res.Version)
        done()
      })
    })
  })

  describe('.commands', function () {
    it('lists commands', function (done) {
      this.timeout(10000)
      apiClients['a'].commands((err, res) => {
        if (err) {
          throw err
        }
        assert(res)
        done()
      })
    })
  })

  describe('.mount', () => {
    // requires FUSE to be installed, not practical for testing
  })

  describe('.diag', function () {
    it('.diag.net', function (done) {
      this.timeout(1000000)
      apiClients['a'].diag.net((err, res) => {
        if (err) {
          throw err
        }
        assert(res)
        done()
      })
    })

    it('.diag.sys', function (done) {
      apiClients['a'].diag.sys((err, res) => {
        if (err) {
          throw err
        }
        assert(res)
        assert(res.memory)
        assert(res.diskinfo)
        done()
      })
    })
  })

  describe('.block', function () {
    const blorbKey = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
    const blorb = Buffer('blorb')

    it('block.put', function (done) {
      this.timeout(10000)

      apiClients['a'].block.put(blorb, (err, res) => {
        if (err) throw err
        const store = res.Key
        assert.equal(store, 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ')
        done()
      })
    })

    it('block.get', function (done) {
      this.timeout(10000)

      apiClients['a'].block.get(blorbKey, (err, res) => {
        if (err) throw err

        let buf = ''
        res
          .on('data', function (data) { buf += data })
          .on('end', function () {
            assert.equal(buf, 'blorb')
            done()
          })
      })
    })
  })

  describe('.object', function () {
    const testObject = Buffer(JSON.stringify({Data: 'testdata', Links: []}))
    const testObjectHash = 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD'
    const testPatchObject = Buffer(JSON.stringify({Data: 'new test data'}))
    const testPatchObjectHash = 'QmWJDtdQWQSajQPx1UVAGWKaSGrHVWdjnrNhbooHP7LuF2'

    it('object.put', function (done) {
      apiClients['a'].object.put(testObject, 'json', (err, res) => {
        if (err) throw err
        const obj = res
        assert.equal(obj.Hash, testObjectHash)
        assert.equal(obj.Links.length, 0)
        done()
      })
    })

    it('object.get', function (done) {
      apiClients['a'].object.get(testObjectHash, (err, res) => {
        if (err) {
          throw err
        }
        const obj = res
        assert.equal(obj.Data, 'testdata')
        assert.equal(obj.Links.length, 0)
        done()
      })
    })

    it('object.data', function (done) {
      this.timeout(10000)
      apiClients['a'].object.data(testObjectHash, (err, res) => {
        if (err) throw err

        let buf = ''
        res
          .on('error', err => { throw err })
          .on('data', data => buf += data)
          .on('end', () => {
            assert.equal(buf, 'testdata')
            done()
          })
      })
    })

    it('object.stat', function (done) {
      this.timeout(10000)
      apiClients['a'].object.stat(testObjectHash, (err, res) => {
        if (err) {
          throw err
        }
        assert.deepEqual(res, {
          Hash: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
          NumLinks: 0,
          BlockSize: 10,
          LinksSize: 2,
          DataSize: 8,
          CumulativeSize: 10
        })
        done()
      })
    })

    it('object.links', function (done) {
      this.timeout(10000)
      apiClients['a'].object.links(testObjectHash, (err, res) => {
        if (err) {
          throw err
        }

        assert.deepEqual(res, {
          Hash: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
          Links: []
        })
        done()
      })
    })

    it('object.patch', function (done) {
      this.timeout(10000)
      apiClients['a'].object.put(testPatchObject, 'json', (err, res) => {
        if (err) {
          throw err
        }
        apiClients['a'].object.patch(testObjectHash, ['add-link', 'next', testPatchObjectHash], (err, res) => {
          if (err) {
            throw err
          }

          assert.deepEqual(res, {
            Hash: 'QmZFdJ3CQsY4kkyQtjoUo8oAzsEs5BNguxBhp8sjQMpgkd',
            Links: null
          })
          apiClients['a'].object.get(res.Hash, (err, res2) => {
            if (err) {
              throw err
            }
            assert.deepEqual(res2, {
              Data: 'testdata',
              Links: [{
                Name: 'next',
                Hash: 'QmWJDtdQWQSajQPx1UVAGWKaSGrHVWdjnrNhbooHP7LuF2',
                Size: 15
              }]
            })
            done()
          })
        })
      })
    })
  })

  describe('.swarm', function () {
    it('.swarm.peers', function (done) {
      this.timeout(5000)

      apiClients['a'].swarm.peers((err, res) => {
        if (err) {
          throw err
        }

        assert(res.Strings.length >= 2)
        done()
      })
    })
    it('.swarm.connect', function (done) {
      // Done in the 'before' segment
      done()
    })
  })

  if (isNode) {
    // Ping returns streaming json in the browser
    // which breaks the parser atm. See https://github.com/ipfs/node-ipfs-api/issues/86
    describe('.ping', function () {
      it('ping another peer', function (done) {
        apiClients['b'].id((err, id) => {
          if (err) {
            throw err
          }

          apiClients['a'].ping(id.ID, (err, res) => {
            if (err) {
              throw err
            }
            assert(res)
            assert(res.Success)
            done()
          })
        })
      })
    })
  }

  describe('.id', function () {
    it('id', function (done) {
      this.timeout(10000)
      apiClients['a'].id((err, res) => {
        if (err) throw err
        const id = res
        assert(id.ID)
        assert(id.PublicKey)
        done()
      })
    })
  })

  describe('.pin', function () {
    it('.pin.add', function (done) {
      this.timeout(5000)

      apiClients['b'].pin.add('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {recursive: false}, (err, res) => {
        if (err) {
          throw err
        }
        assert.equal(res.Pinned[0], 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        done()
      })
    })

    it('.pin.list', function (done) {
      this.timeout(5000)

      apiClients['b'].pin.list((err, res) => {
        if (err) {
          throw err
        }
        assert(res)
        done()
      })
    })

    it('.pin.remove', function (done) {
      this.timeout(5000)

      apiClients['b'].pin.remove('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {recursive: false}, (err, res) => {
        if (err) {
          throw err
        }
        assert(res)
        apiClients['b'].pin.list('direct', (err, res) => {
          if (err) {
            throw err
          }
          assert(res)
          assert.equal(Object.keys(res.Keys).length, 0)
          done()
        })
      })
    })
  })

  describe('.log', function () {
    it('.log.tail', function (done) {
      this.timeout(20000)

      apiClients['a'].log.tail((err, res) => {
        if (err) {
          throw err
        }
        res.once('data', obj => {
          assert(obj)
          assert.equal(typeof obj, 'object')
          done()
        })
      })
    })
  })

  describe('.name', function () {
    let name
    it('.name.publish', function (done) {
      apiClients['a'].name.publish('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
        if (err) {
          throw err
        }
        assert(res)
        name = res
        done()
      })
    })
    it('.name.resolve', function (done) {
      apiClients['a'].name.resolve(name.Name, (err, res) => {
        if (err) {
          throw err
        }

        assert(res)
        assert.deepEqual(res, { Path: '/ipfs/' + name.Value })
        done()
      })
    })
  })

  if (isNode) {
    describe('.refs', function () {
      const folder = 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg'

      it('refs', function (done) {
        if (!isNode) {
          return done()
        }

        this.timeout(10000)
        apiClients['a'].refs(folder, {'format': '<src> <dst> <linkname>'}, (err, objs) => {
          if (err) {
            throw err
          }

          const result = [{
            Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmcUYKmQxmTcFom4R4UZP7FWeQzgJkwcFn51XrvsMy7PE9 add.js',
            Err: ''
          }, {
            Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmNeHxDfQfjVFyYj2iruvysLH9zpp78v3cu1s3BZq1j5hY cat.js',
            Err: ''
          }, {
            Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmTYFLz5vsdMpq4XXw1a1pSxujJc9Z5V3Aw1Qg64d849Zy files',
            Err: ''
          }, {
            Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmU7wetVaAqc3Meurif9hcYBHGvQmL5QdpPJYBoZizyTNL ipfs-add.js',
            Err: ''
          }, {
            Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmctZfSuegbi2TMFY2y3VQjxsH5JbRBu7XmiLfHNvshhio ls.js',
            Err: ''
          }, {
            Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmTDH2RXGn8XyDAo9YyfbZAUXwL1FCr44YJCN9HBZmL9Gj test-folder',
            Err: ''
          }, {
            Ref: 'QmSzLpCVbWnEm3XoTWnv6DT6Ju5BsVoLhzvxKXZeQ2cmdg QmbkMNB6rwfYAxRvnG9CWJ6cKKHEdq2ZKTozyF5FQ7H8Rs version.js',
            Err: ''
          }]
          assert.deepEqual(objs, result)

          done()
        })
      })
    })
  }

  describe('.dht', function () {
    it('returns an error when getting a non-existent key from the DHT',
      function (done) {
        this.timeout(20000)
        apiClients['a'].dht.get('non-existent', {timeout: '100ms'}, (err, value) => {
          assert(err)
          done()
        })
      })

    it('puts and gets a key value pair in the DHT', function (done) {
      this.timeout(20000)

      apiClients['a'].dht.put('scope', 'interplanetary', (err, res) => {
        if (err) {
          throw err
        }

        assert.equal(typeof res, 'object')

        return done()

        // non ipns or pk hashes fail to fetch, known bug
        // bug: https://github.com/ipfs/go-ipfs/issues/1923#issuecomment-152932234
        // apiClients['a'].dht.get('scope', (err, value) => {
        //  console.log('->>', err, value)
        //  if (err) {
        //    throw err
        //  }
        //  assert.equal(value, 'interplanetary')
        //  done()
        // })
      })
    })

    it('.dht.findprovs', function (done) {
      apiClients['a'].dht.findprovs('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
        if (err) {
          throw err
        }

        assert.equal(typeof res, 'object')
        assert(res)
        done()
      })
    })
  })
})
