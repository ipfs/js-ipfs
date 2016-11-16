'use strict'

const IPFS = require('../../src/core') // replace this by line below
// const IPFS = require('ipfs')

/*
 * Create a new IPFS instance, using default repo (fs) on default path (~/.ipfs)
 */
const node = new IPFS()

const fs = require('fs')

/*
 * Display version of js-ipfs
 */
node.version(gotVersion)

function gotVersion (err, version) {
  if (err) {
    return console.error(err)
  }

  console.log(version)

  /*
   * Load the config into memory (generate the Public Key from the Private Key)
   */
  node.load((err) => {
    if (err) {
      return console.log(err)
    }
    console.log('Repo was loaded\n')

    /*
     * Our instance is set, now let's goOnline (turn on bitswap) and do cool
     * stuff
     */

    node.goOnline((err) => {
      if (err) {
        return console.log(err)
      }

      // We can test to see if we actually are online if we want to
      if (node.isOnline()) {
        console.log('\nYep, we are online')
      }

      /*
       * Add a file to IPFS - Complete Files API on:
       * https://github.com/ipfs/interface-ipfs-core/tree/master/API/files
       */

      const file = {
        path: 'hello.txt',
        content: fs.createReadStream('./hello.txt')
      }

      node.files.add(file, (err, result) => {
        if (err) {
          return console.error(err)
        }

        /*
         * Awesome we've added a file so let's retrieve and
         * display its contents from IPFS
         */

        console.log('\n', result, '\n')

        node.files.cat(result[0].hash, (err, stream) => {
          if (err) {
            return console.error(err)
          }

          console.log('file content: \n')

          stream.pipe(process.stdout)
          stream.on('end', process.exit)
        })
      })
    })
  })
}
