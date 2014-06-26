#!/usr/bin/env node

var ipfsMount = require('../ipfs-mount')

module.exports = mount
function mount(ipfs, argv) {
  ipfsPath = '/'
  osPath = '/ipfs'

  var args = argv._args
  switch (args.length) {
  case 1: osPath = args[0]; break
  case 2:
    ipfsPath = args[0]
    osPath = args[1]
  }

  // defaults
  osPath = osPath || '/ipfs'
  ipfsPath = ipfsPath || '/'

  // handlers
  process.on('SIGINT', onSIGINT)
  process.on('SIGTERM', onSIGTERM)

  console.log('Mounting ' + ipfsPath + ' at ' + osPath)
  var mounted = ipfsMount(ipfs, ipfsPath, osPath)

  var closing = false
  function onSIGINT() {
    if (closing) return
    closing = true
    console.log('Unmounting...')
    mounted.terminate()
    // mounted.umount(function() {
    //   console.log('Done.')
    //   process.exit()
    // })
  }

  function onSIGTERM() {
    console.log('Terminated.')
    process.exit(0)
  }
}
