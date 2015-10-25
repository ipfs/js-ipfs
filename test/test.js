var ipfsAPI = require('../src/index.js')
var assert = require('assert')
var fs = require('fs')
var path = require('path')
var File = require('vinyl')

var isNode = !global.window

if (isNode) {
  var ipfsd = require('ipfsd-ctl')
}

// this comment is used by mocha, do not delete
/* global describe, before, it */

function log () {
  var args = ['    #']
  args = args.concat(Array.prototype.slice.call(arguments))
  console.log.apply(console, args)
}

var testfilePath = __dirname + '/testfile.txt'
var testfile = fs.readFileSync(__dirname + '/testfile.txt')

describe('IPFS Node.js API wrapper tests', function () {
  var apiClients = {} // a, b, c
  var ipfsNodes = {} // a, b, c

  before(function (done) {
    this.timeout(20000)
    log('ipfs node setup')
    var counter = 0

    if (isNode) {
      startIndependentNode(ipfsNodes, apiClients, 'a', finish)
      startIndependentNode(ipfsNodes, apiClients, 'b', finish)
      startIndependentNode(ipfsNodes, apiClients, 'c', finish)
    } else {
      apiClients['a'] = ipfsAPI('localhost', '5001')
      done()
    }

    function finish () {
      counter++
      if (counter === 3) {
        done()
      }
    }

    function startIndependentNode (ipfsNodes, apiClients, key, cb) {
      ipfsd.disposable(function (err, node) {
        if (err) {
          throw err
        }

        log('ipfs init done - ' + key)
        ipfsNodes[key] = node

        log('ipfs config (bootstrap and mdns off) - ' + key)

        ipfsNodes[key].setConfig('Bootstrap', null, function (err) {
          if (err) {
            throw err
          }
          ipfsNodes[key].setConfig('Mdns', false, function (err) {
            if (err) {
              throw err
            }

            ipfsNodes[key].startDaemon(function (err, ignore) {
              if (err) {
                throw err
              }
              log('ipfs daemon running - ' + key)

              apiClients[key] = ipfsAPI(ipfsNodes[key].apiAddr)
              cb()
            })
          })
        })
      })
    }
  })

  it('connect Node a to b and c', function (done) {
    var addrs = {}
    var counter = 0
    collectAddr('b', finish)
    collectAddr('c', finish)

    function finish () {
      counter++
      if (counter === 2) {
        dial()
      }
    }

    function collectAddr (key, cb) {
      apiClients[key].id(function (err, id) {
        if (err) {
          throw err
        }
        addrs[key] = ipfsNodes[key].apiAddr + '/ipfs/' + id.ID
        cb()
      })
    }

    function dial () {
      apiClients['a'].swarm.connect(addrs['b'], function (err) {
        if (err) {
          throw err
        }
        apiClients['a'].swarm.connect(addrs['c'], function (err) {
          if (err) {
            throw err
          }
          done()
        })
      })
    }
  })

  it('has the api object', function () {
    assert(apiClients['a'])
    assert(apiClients['a'].id)
  })

  describe('.send', function () {
    it('used by every command')
  })

  describe('.add', function () {
    it('add file', function (done) {
      this.timeout(10000)

      var file = new File({
        cwd: path.dirname(testfilePath),
        base: path.dirname(testfilePath),
        path: testfilePath,
        contents: new Buffer(testfile)
      })

      apiClients['a'].add(file, function (err, res) {
        if (err) throw err

        var added = res[0] != null ? res[0] : res
        assert.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        assert.equal(added.Name, path.basename(testfilePath))
        done()
      })
    })

    it('add buffer', function (done) {
      this.timeout(10000)

      var buf = new Buffer(testfile)
      apiClients['a'].add(buf, function (err, res) {
        if (err) throw err

        // assert.equal(res.length, 1)
        var added = res[0] != null ? res[0] : res
        assert.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        done()
      })
    })

    // Not working due to fs.lstat not being available in the browser
    it('add path', function (done) {
      this.timeout(10000)

      apiClients['a'].add(testfilePath, function (err, res) {
        if (err) throw err

        var added = res[0] != null ? res[0] : res
        assert.equal(added.Hash, 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        done()
      })
    })

    it('add a nested dir', function (done) {
      this.timeout(10000)

      apiClients['a'].add(__dirname + '/test-folder', { recursive: true }, function (err, res) {
        if (err) {
          throw err
        }
        var added = res[res.length - 1]
        assert.equal(added.Hash, 'QmaMTzaGBmdLrispnPRTESta4yDQdK4uKSVcQez2No4h6q')
        done()
      })
    })
  })

  describe('.cat', function () {
    it('cat', function (done) {
      this.timeout(10000)

      apiClients['a'].cat('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', function (err, res) {
        if (err) throw err

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
    var initDocs = 'Qmcqtw8FfrVSBaRmbWwHxt3AuySBhJLcvmFYi3Lbc4xnwj'
    var initDocsLs = {
      'help': 'QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7',
      'about': 'QmfE3nUohq2nEYwieF7YFnJF1VfiL4i3wDxkMq8aGUg8Mt',
      'readme': 'QmUFtMrBHqdjTtbebsL6YGebvjShh3Jud1insUv12fEVdA',
      'contact': 'QmYCvbfNbCwFR45HiNP45rwJgvatpiW38D961L5qAhUM5Y',
      'quick-start': 'QmeEqpsKrvdhuuuVsguHaVdJcPnnUHHZ5qEWjCHavYbNqU',
      'security-notes': 'QmTumTjvcYCAvRRwQ8sDRxh8ezmrcr88YFU7iYNroGGTBZ'
    }
    it.skip('ls', function (done) {
      this.timeout(10000)

      apiClients['a'].ls(initDocs, function (err, res) {
        if (err) throw err

        var dir = res.Objects[0]
        for (var i in dir.Links) {
          var link = dir.Links[i]
          assert.equal(link.Hash, initDocsLs[link.Name])
        }
        assert.equal(dir.Hash, initDocs)
        assert.equal(dir.Links.length, 6)
        assert.equal(dir.Links[0].Name, 'about')
        assert.equal(dir.Links[5].Name, 'security-notes')

        done()
      })
    })
  })

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
    it('.config.replace')
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
    var testObject =
      Buffer(JSON.stringify({Data: 'testdata', Links: []}))
    var testObjectHash =
      'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD'

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
  })

  describe('.swarm', function () {
    it('.swarm.peers')
    it('.swarm.connect', function (done) {
      // Done in the before part
      done()
    })
  })

  describe('.ping', function () {
  })

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

  describe('.pin', function () {
    it('.pin.add')
    it('.pin.remove')
    it('.pin.list')
  })

  describe('.gateway', function () {
    it('.gateway.disable')
    it('.gateway.enable')
  })

  describe('.log', function () {
    it('.log.tail')
  })

  describe('.name', function () {
    it('.name.publish')
    it('.name.resolve')
  })

  describe('.refs', function () {
    var initDocs = 'Qmcqtw8FfrVSBaRmbWwHxt3AuySBhJLcvmFYi3Lbc4xnwj'
    var initDocsLs = {
      'help': 'QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7',
      'about': 'QmfE3nUohq2nEYwieF7YFnJF1VfiL4i3wDxkMq8aGUg8Mt',
      'readme': 'QmUFtMrBHqdjTtbebsL6YGebvjShh3Jud1insUv12fEVdA',
      'contact': 'QmYCvbfNbCwFR45HiNP45rwJgvatpiW38D961L5qAhUM5Y',
      'quick-start': 'QmeEqpsKrvdhuuuVsguHaVdJcPnnUHHZ5qEWjCHavYbNqU',
      'security-notes': 'QmTumTjvcYCAvRRwQ8sDRxh8ezmrcr88YFU7iYNroGGTBZ'
    }

    it.skip('refs', function (done) {
      this.timeout(10000)
      apiClients['a'].refs(initDocs, {'format': '<src> <dst> <linkname>'}, function (err, objs) {
        if (err) throw err
        for (var i in objs) {
          var ref = objs[i]
          var refp = ref.Ref.replace('\n', '').split(' ')
          assert.equal(refp[0], initDocs)
          assert(initDocsLs[refp[2]])
          assert.equal(refp[1], initDocsLs[refp[2]])
          assert.equal(ref.Err, '')
        }
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

      apiClients['a'].dht.put('scope', 'interplanetary', function (err, cb) {
        assert(!err)
        if (err) {
          done()
          return
        }

        apiClients['a'].dht.get('scope', function (err, value) {
          if (err) console.error(err)
          assert.equal(value, 'interplanetary')
          done()
        })
      })
    })

    it('.dht.findproovs')
  })

  describe('closing tests', function () {
    if (isNode) {
      // Not available in the browser
      it('test for error after daemon stops', function (done) {
        this.timeout(6000)
        stopIPFSNode(ipfsNodes, apiClients, 'a', finish)
        stopIPFSNode(ipfsNodes, apiClients, 'b', finish)
        stopIPFSNode(ipfsNodes, apiClients, 'c', finish)

        var counter = 0

        function finish () {
          counter++
          if (counter === 3) {
            done()
          }
        }

        function stopIPFSNode (ipfsNodes, apiClients, key, cb) {
          var nodeStopped
          ipfsNodes[key].stopDaemon(function (err) {
            if (err) {
              throw err
            }
            if (!nodeStopped) {
              nodeStopped = true
              apiClients[key].id(function (err, res) {
                assert.equal(err.code, 'ECONNREFUSED')
                cb()
              })
            }
          })
        }
      })
    }
  })
})
