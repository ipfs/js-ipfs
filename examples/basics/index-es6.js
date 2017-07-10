'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
// const IPFS = require('../../src/core')
// replace this by line below if you are using ipfs as a dependency of your
// project
const IPFS = require('ipfs')

/*
 * Create a new IPFS instance, using default repo (fs) on default path (~/.ipfs)
 */
const node = new IPFS({
  repo: path.join(os.tmpdir() + '/' + new Date().toString()),
  init: false,
  start: false,
  EXPERIMENTAL: {
    pubsub: false
  }
})

const fileToAdd = {
  path: 'hello.txt',
  content: fs.createReadStream('./hello.txt')
}

/*
 * Display version of js-ipfs
 */
node.version()
  .then((version) => {
    console.log('IPFS Version:', version.version)
    return Promise.resolve()
  })

  /*
   * Initialize the repo for this node
   */
  .then(() => {
    return node.init({ emptyRepo: true, bits: 2048 })
  })

  /*
   * Take the node online (bitswap, network and so on)
   */
  .then(() => {
    return node.start()
  })

  /*
   * Add a file to IPFS - Complete Files API on:
   * https://github.com/ipfs/interface-ipfs-core/tree/master/API/files
   */
  .then(() => {
    if (node.isOnline()) {
      console.log('\nNode is now ready and online')
    }
    return node.files.add(fileToAdd)
  })

  .then((result) => {
    let file = result[0]
    console.log('\nAdded file:')
    console.log(file)
    let fileMultihash = file.hash
    return Promise.resolve(fileMultihash)
  })

  /*
   * Awesome we've added a file so let's retrieve and
   * display its contents from IPFS
   */
  .then((fileMultihash) => {
    return node.files.cat(fileMultihash)
  })

  .then((stream) => {
    console.log('\nFile content:')
    stream.pipe(process.stdout)
    stream.on('end', process.exit)
    return Promise.resolve()
  })

  .then(() => {
    console.log('Success!')
  })

  .catch((err) => {
    console.log(err)
  })
