var fs = require('fs')
var IPFS = require('ipfs')
var node = new IPFS()

var fileName = './hello.txt'

// Display version of js-ipfs
node.version(function (err, versionData) {
  if (!err) {
    console.log(versionData)
    // We can load the repo like this.
    node.load(function (err) {
      // If there is an erro loading the repo we can find out like this.
      if (err) {
        console.log(err)
      } else {
        console.log('The repo is loaded now.')
      }
      // Ok let's go online and do some cool stuff
      node.goOnline(function () {
        // We can test to see if we actually are online if we want to
        if (node.isOnline()) console.log('Yep, we are online')
        // Now that we are online now. Let's add a file.
        var readStream = fs.createReadStream(fileName)
        node.files.add(readStream, function (err, data) {
          if (!err) {
            // Awesome we've added a file so let's retrieve and display its contents from IPFS
            node.files.cat(data[0].hash, function (err, stream) {
              if (!err) {
                stream.pipe(process.stdout, { end: false })
                // let's call it a day now and go offline
                node.goOffline()
              } else { console.log('Oops for some reason there was a problem retrieving your file: ' + err) }
            })
          } else { console.log('Oops there was a problem: ' + err) }
        })
      })
    })
  } else { console.log(err) }
})
