var gulp = require('gulp')
var fs = require('fs')

var daemons

gulp.task('daemons:start', function (done) {
  startDisposableDaemons(function (d) {
    daemons = d
    done()
  })
})

gulp.task('daemons:stop', function (done) {
  stopDisposableDaemons(daemons, function () {
    daemons = null
    done()
  })
})

function startDisposableDaemons (callback) {
  var ipfsd = require('ipfsd-ctl')

  var ipfsNodes = {} // a, b, c
  var apiAddrs = {} // a, b, c

  var counter = 0
  startIndependentNode(ipfsNodes, apiAddrs, 'a', finish)
  startIndependentNode(ipfsNodes, apiAddrs, 'b', finish)
  startIndependentNode(ipfsNodes, apiAddrs, 'c', finish)

  function finish () {
    counter++
    if (counter === 3) {
      fs.writeFileSync(__dirname + '/../test/tmp-disposable-nodes-addrs.json', JSON.stringify(apiAddrs))
      callback(ipfsNodes)
    }
  }

  function startIndependentNode (ipfsNodes, apiAddrs, key, cb) {
    ipfsd.disposable(function (err, node) {
      if (err) {
        throw err
      }

      ipfsNodes[key] = node

      console.log('  ipfs init done - (bootstrap and mdns off) - ' + key)

      ipfsNodes[key].setConfig('Bootstrap', null, function (err) {
        if (err) {
          throw err
        }
        ipfsNodes[key].setConfig('Discovery', '{}', function (err) {
          if (err) {
            throw err
          }

          ipfsNodes[key].setConfig('API', '{"HTTPHeaders": {"Access-Control-Allow-Origin": ["*"]}}', function (err) {
            if (err) {
              throw err
            }

            ipfsNodes[key].startDaemon(function (err, ignore) {
              if (err) {
                throw err
              }

              apiAddrs[key] = ipfsNodes[key].apiAddr
              cb()
            })
          })
        })
      })
    })
  }
}

function stopDisposableDaemons (daemons, callback) {
  stopIPFSNode(daemons, 'a', finish)
  stopIPFSNode(daemons, 'b', finish)
  stopIPFSNode(daemons, 'c', finish)

  var counter = 0
  function finish () {
    counter++
    if (counter === 3) {
      callback()
    }
  }

  function stopIPFSNode (daemons, key, cb) {
    var nodeStopped
    daemons[key].stopDaemon(function (err) {
      if (err) {
        throw err
      }
      if (!nodeStopped) {
        nodeStopped = true
        cb()
      }
    })
  }
}
