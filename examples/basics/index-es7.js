'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const promisify = require('promisify-es6')
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

async function main () {
  try {
    /*
     * Display version of js-ipfs
     */
    let version = await node.version()
    console.log('IPFS Version:', version)

    /*
     * Initialize the repo for this node
     */
    await promisify(node.init)({ emptyRepo: true, bits: 2048 })

    /*
     * Take the node online (bitswap, network and so on)
     */
    await promisify(node.start)()
    console.log('IPFS node is online')

    /*
     * Add a file to IPFS - Complete Files API on:
     * https://github.com/ipfs/interface-ipfs-core/tree/master/API/files
     */
    let addedFiles = await node.files.add(fileToAdd)
    let addedFile = addedFiles[0]
    console.log('\nAdded file:')
    console.log(addedFile)

    /*
     * Awesome we've added a file so let's retrieve and
     * display its contents from IPFS
     */
    let stream = await node.files.cat(addedFile.hash)
    console.log('\nFile content:\n')
    stream.pipe(process.stdout)
    stream.on('end', process.exit)

    console.log('Success!')

  } catch (err) {
    console.log(err)
  }
}

main()
