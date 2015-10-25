var gulp = require('gulp')
// var Server = require('karma').Server;
var mocha = require('gulp-mocha')
var ipfsd = require('ipfsd-ctl')
var fs = require('fs')

gulp.task('default', function () {
  gulp.start('test:node')
})

gulp.task('test:node', function (done) {
  startDisposableDaemons(function (daemons) {
    gulp.src('test/tests.js')
      // gulp-mocha needs filepaths so you can't have any plugins before it
      .pipe(mocha())
      .once('error', function () {
        process.exit(1)
      })
      .once('end', function () {
        stopDisposableDaemons(daemons, function () {
          process.exit()
        })
      })
  })
})

function startDisposableDaemons (callback) {
  var ipfsNodes = {} // a, b, c
  var apiAddrs = {} // a, b, c

  var counter = 0
  startIndependentNode(ipfsNodes, apiAddrs, 'a', finish)
  startIndependentNode(ipfsNodes, apiAddrs, 'b', finish)
  startIndependentNode(ipfsNodes, apiAddrs, 'c', finish)

  function finish () {
    counter++
    if (counter === 3) {
      fs.writeFileSync(__dirname + '/test/tmp-disposable-nodes-addrs.json', JSON.stringify(apiAddrs))
      callback(ipfsNodes)
    }
  }

  function startIndependentNode (ipfsNodes, apiAddrs, key, cb) {
    ipfsd.disposable(function (err, node) {
      if (err) {
        throw err
      }

      console.log('ipfs init done - ' + key)
      ipfsNodes[key] = node

      console.log('ipfs config (bootstrap and mdns off) - ' + key)

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

            apiAddrs[key] = ipfsNodes[key].apiAddr
            cb()
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

/*
gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});
*/
