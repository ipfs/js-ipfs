process.env.NODE_ENV = 'test'
var test = require('tape')
var ipfsd = require('ipfsd-ctl')
var IPFS = require('../src')
var fs = require('fs')
var path = require('path')
var File = require('vinyl')

var testfilePath = __dirname + '/testfile.txt'
var testfile = fs.readFileSync(__dirname + '/testfile.txt')

var node
var daemon

test('start disposable deamon', function (t) {
  ipfsd.disposable(function (err, node) {
    t.error(err)
    t.ok(node)
    daemon = node

    node.startDaemon(function (err) {
      t.error(err)
      console.log(node.apiAddr)
      process.env.APIURL = node.apiAddr
      t.end()
    })
  })
})

test('create an JS IPFS node', function (t) {
  node = new IPFS()
  t.ok(node)
  t.end()
})

// basic commands

test('init', function (t) {
  t.throws(node.init)
  t.end()
})

test('add file', {timeout: 10000}, function (t) {
  var file = new File({
    cwd: path.dirname(testfilePath),
    base: path.dirname(testfilePath),
    path: testfilePath,
    contents: new Buffer(testfile)
  })

  node.add(file, function (err, res) {
    t.error(err)

    var added = res[0] !== null ? res[0] : res
    t.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
    t.equal(added.Name, path.basename(testfilePath))
    t.end()
  })
})

test('add buffer', {timeout: 10000}, function (t) {
  var buf = new Buffer(testfile)
  node.add(buf, function (err, res) {
    t.error(err)

    var added = res[0] !== null ? res[0] : res
    t.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
    t.end()
  })
})

test('add path', {timeout: 10000}, function (t) {
  node.add(testfilePath, function (err, res) {
    t.error(err)

    var added = res[0] !== null ? res[0] : res
    t.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
    t.end()
  })
})

test('add a nested dir', {timeout: 10000}, function (t) {
  node.add(__dirname + '/test-folder', { recursive: true }, function (err, res) {
    t.error(err)

    var added = res[res.length - 1]
    t.equal(added.Hash, 'QmZdsefMGMeG6bL719gX44XSVQrL6psEgRZdw1SGadFaK2')
    t.end()
  })
})

/*
describe('.cat', function () {
  it('cat', function (done) {
    this.timeout(10000)

    apiClients['a'].cat('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', function (err, res) {
      if (err) {
        throw err
      }

      if (typeof res === 'string') {
        // Just  a string
        assert.equal(res, testfile)
        done()
        return
      }

      var buf = ''
      res
        .on('error', function (err) { throw err })
        .on('data', function (data) { buf += data })
        .on('end', function () {
          assert.equal(buf, testfile)
          done()
        })
    })
  })
})

describe('.ls', function () {
  var folder = 'QmaMTzaGBmdLrispnPRTESta4yDQdK4uKSVcQez2No4h6q'
  it('ls', function (done) {
    if (!isNode) {
      return done()
    }

    this.timeout(100000)

    apiClients['a'].ls(folder, function (err, res) {
      if (err) {
        throw err
      }

      var objs = {
        Hash: 'QmaMTzaGBmdLrispnPRTESta4yDQdK4uKSVcQez2No4h6q',
        Links: [{
          Name: 'add.js',
          Hash: 'QmaeuuKLHzirbVoTjb3659fyyV381amjaGrU2pecHEWPrN',
          Size: 481,
          Type: 2
        }, {
          Name: 'cat.js',
          Hash: 'QmTQhTtDWeaaP9pttDd1CuoVTLQm1w51ABfjgmGUbCUF6i',
          Size: 364,
          Type: 2
        }, {
          Name: 'files',
          Hash: 'QmTYFLz5vsdMpq4XXw1a1pSxujJc9Z5V3Aw1Qg64d849Zy',
          Size: 132,
          Type: 1
        }, {
          Name: 'ipfs-add.js',
          Hash: 'QmTjXxUemcuMAZ2KNN3iJGWHwrkMsW8SWEwkYVSBi1nFD9',
          Size: 315,
          Type: 2
        }, {
          Name: 'ls.js',
          Hash: 'QmXYUXDFNNh1wgwtX5QDG7MsuhAAcE9NzDYnz8SjnhvQrK',
          Size: 428,
          Type: 2
        }, {
          Name: 'version.js',
          Hash: 'QmUmDmH4hZgN5THnVP1VjJ1YWh5kWuhLGUihch8nFiD9iy',
          Size: 153,
          Type: 2 }]
      }

      assert.deepEqual(res.Objects[0], objs)
      done()
    })
  })
})

if (isNode) {
  describe('.refs', function () {
    var folder = 'QmaMTzaGBmdLrispnPRTESta4yDQdK4uKSVcQez2No4h6q'

    it('refs', function (done) {
      if (!isNode) {
        return done()
      }

      this.timeout(10000)
      apiClients['a'].refs(folder, {'format': '<src> <dst> <linkname>'}, function (err, objs) {
        if (err) {
          throw err
        }

        var result = [{
          Ref: 'QmaMTzaGBmdLrispnPRTESta4yDQdK4uKSVcQez2No4h6q QmaeuuKLHzirbVoTjb3659fyyV381amjaGrU2pecHEWPrN add.js',
          Err: '' },
          { Ref: 'QmaMTzaGBmdLrispnPRTESta4yDQdK4uKSVcQez2No4h6q QmTQhTtDWeaaP9pttDd1CuoVTLQm1w51ABfjgmGUbCUF6i cat.js',
          Err: '' },
          { Ref: 'QmaMTzaGBmdLrispnPRTESta4yDQdK4uKSVcQez2No4h6q QmTYFLz5vsdMpq4XXw1a1pSxujJc9Z5V3Aw1Qg64d849Zy files',
          Err: '' },
          { Ref: 'QmaMTzaGBmdLrispnPRTESta4yDQdK4uKSVcQez2No4h6q QmTjXxUemcuMAZ2KNN3iJGWHwrkMsW8SWEwkYVSBi1nFD9 ipfs-add.js',
          Err: '' },
          { Ref: 'QmaMTzaGBmdLrispnPRTESta4yDQdK4uKSVcQez2No4h6q QmXYUXDFNNh1wgwtX5QDG7MsuhAAcE9NzDYnz8SjnhvQrK ls.js',
          Err: '' },
          { Ref: 'QmaMTzaGBmdLrispnPRTESta4yDQdK4uKSVcQez2No4h6q QmUmDmH4hZgN5THnVP1VjJ1YWh5kWuhLGUihch8nFiD9iy version.js',
          Err: '' } ]

        assert.deepEqual(objs, result)

        done()
      })
    })
  })
}
*/

// data structure commands

/*
describe('.block', function () {
  var blorbKey = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
  var blorb = Buffer('blorb')

  it('block.put', function (done) {
    this.timeout(10000)

    apiClients['a'].block.put(blorb, function (err, res) {
      if (err) throw err
      var store = res.Key
      assert.equal(store, 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ')
      done()
    })
  })

  it('block.get', function (done) {
    this.timeout(10000)

    apiClients['a'].block.get(blorbKey, function (err, res) {
      if (err) throw err

      if (typeof res === 'string') {
        // Just  a string
        assert.equal(res, 'blorb')
        done()
        return
      }

      var buf = ''
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
  var testObject = Buffer(JSON.stringify({Data: 'testdata', Links: []}))
  var testObjectHash = 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD'
  var testPatchObject = Buffer(JSON.stringify({Data: 'new test data'}))
  var testPatchObjectHash = 'QmWJDtdQWQSajQPx1UVAGWKaSGrHVWdjnrNhbooHP7LuF2'

  it('object.put', function (done) {
    apiClients['a'].object.put(testObject, 'json', function (err, res) {
      if (err) throw err
      var obj = res
      assert.equal(obj.Hash, testObjectHash)
      assert.equal(obj.Links.length, 0)
      done()
    })
  })

  it('object.get', function (done) {
    apiClients['a'].object.get(testObjectHash, function (err, res) {
      if (err) {
        throw err
      }
      var obj = res
      assert.equal(obj.Data, 'testdata')
      assert.equal(obj.Links.length, 0)
      done()
    })
  })

  it('object.data', function (done) {
    this.timeout(10000)
    apiClients['a'].object.data(testObjectHash, function (err, res) {
      if (err) throw err

      if (typeof res === 'string') {
        // Just  a string
        assert.equal(res, 'testdata')
        done()
        return
      }

      var buf = ''
      res
        .on('error', function (err) { throw err })
        .on('data', function (data) { buf += data })
        .on('end', function () {
          assert.equal(buf, 'testdata')
          done()
        })
    })
  })

  it('object.stat', function (done) {
    this.timeout(10000)
    apiClients['a'].object.stat(testObjectHash, function (err, res) {
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
    apiClients['a'].object.links(testObjectHash, function (err, res) {
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
    apiClients['a'].object.put(testPatchObject, 'json', function (err, res) {
      if (err) {
        throw err
      }
      apiClients['a'].object.patch(testObjectHash, ['add-link', 'next', testPatchObjectHash], function (err, res) {
        if (err) {
          throw err
        }
        var o = JSON.parse(res)
        assert.deepEqual(o, {
          Hash: 'QmZFdJ3CQsY4kkyQtjoUo8oAzsEs5BNguxBhp8sjQMpgkd',
          Links: null
        })
        apiClients['a'].object.get(o.Hash, function (err, res) {
          if (err) {
            throw err
          }
          assert.deepEqual(JSON.parse(res), {
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
*/

// advanced commands

/*
describe('.mount', function () {
  // requires FUSE to be installed, not practical for testing
})

describe('.diag', function () {
  it('.diag.net', function (done) {
    this.timeout(1000000)
    apiClients['a'].diag.net(function (err, res) {
      if (err) {
        throw err
      }
      assert(res)
      done()
    })
  })
})

describe('.name', function () {
  var name
  it('.name.publish', function (done) {
    apiClients['a'].name.publish('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', function (err, res) {
      if (err) {
        throw err
      }
      assert(res)
      name = res
      done()
    })
  })
  it('.name.resolve', function (done) {
    apiClients['a'].name.resolve(name.Name, function (err, res) {
      if (err) {
        throw err
      }

      assert(res)
      assert.deepEqual(res, { Path: '/ipfs/' + name.Value })
      done()
    })
  })
})

describe('.pin', function () {
  it('.pin.add', function (done) {
    this.timeout(5000)

    apiClients['b'].pin.add('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {recursive: false}, function (err, res) {
      if (err) {
        throw err
      }
      assert.equal(res.Pinned[0], 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
      done()
    })
  })

  it('.pin.list', function (done) {
    this.timeout(5000)

    apiClients['b'].pin.list(function (err, res) {
      if (err) {
        throw err
      }
      assert(res)
      done()
    })
  })

  it('.pin.remove', function (done) {
    this.timeout(5000)

    apiClients['b'].pin.remove('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {recursive: false}, function (err, res) {
      if (err) {
        throw err
      }
      assert(res)
      apiClients['b'].pin.list('direct', function (err, res) {
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
*/

// network commands

/*
describe('.swarm', function () {
  it('.swarm.peers', function (done) {
    this.timeout(5000)

    apiClients['a'].swarm.peers(function (err, res) {
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
      apiClients['b'].id(function (err, id) {
        if (err) {
          throw err
        }

        apiClients['a'].ping(id.ID, function (err, res) {
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
    apiClients['a'].id(function (err, res) {
      if (err) throw err
      var id = res
      assert(id.ID)
      assert(id.PublicKey)
      done()
    })
  })
})

describe('.dht', function () {
  it('returns an error when getting a non-existent key from the DHT',
    function (done) {
      this.timeout(20000)
      apiClients['a'].dht.get('non-existent', {timeout: '100ms'}, function (err, value) {
        assert(err)
        done()
      })
    })

  it('puts and gets a key value pair in the DHT', function (done) {
    this.timeout(20000)

    apiClients['a'].dht.put('scope', 'interplanetary', function (err, res) {
      if (err) {
        throw err
      }

      return done()

      // non ipns or pk hashes fail to fetch, known bug
      // bug: https://github.com/ipfs/go-ipfs/issues/1923#issuecomment-152932234
      // apiClients['a'].dht.get('scope', function (err, value) {
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
    apiClients['a'].dht.findprovs('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', function (err, res) {
      if (err) {
        throw err
      }
      assert(res)
      done()
    })
  })
})
*/

// tool commands

/*
describe('.config', function () {
  it('.config.{set, get}', function (done) {
    this.timeout(10000)

    var confKey = 'arbitraryKey'
    var confVal = 'arbitraryVal'

    apiClients['a'].config.set(confKey, confVal, function (err, res) {
      if (err) throw err
      apiClients['a'].config.get(confKey, function (err, res) {
        if (err) throw err
        assert.equal(res.Value, confVal)
        done()
      })
    })
  })

  it('.config.show', function (done) {
    this.timeout(10000)

    apiClients['c'].config.show(function (err, res) {
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

    apiClients['c'].config.replace(__dirname + '/r-config.json', function (err, res) {
      if (err) {
        throw err
      }

      assert.equal(res, '')
      done()
    })
  })
})

describe('.update (currently disabled, wait for IPFS 0.4.0 release', function () {
  it('.update.apply')
  it('.update.check')
  it('.update.log')
})

describe('.version', function () {
  it('checks the version', function (done) {
    this.timeout(10000)
    apiClients['a'].version(function (err, res) {
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
    apiClients['a'].commands(function (err, res) {
      if (err) {
        throw err
      }
      assert(res)
      done()
    })
  })
})
*/

// other

/*
describe('.log', function () {
  // TODO news 0.3.9 ndjson stuff
  it.skip('.log.tail', function (done) {
    apiClients['a'].log.tail(function (err, res) {
      if (err) {
        throw err
      }

      console.log('->', res)
      done()
    })
  })
})
*/

// ending

test('close disposable daemon', function (t) {
  var stopped
  daemon.stopDaemon(function (err) {
    if (!stopped) {
      stopped = true
      t.error(err)
      t.end()
    }
  })
})
