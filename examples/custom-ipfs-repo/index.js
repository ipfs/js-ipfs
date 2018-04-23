'use strict'

const IPFS = require('ipfs')
const Repo = require('ipfs-repo')
const fsLock = require('ipfs-repo/src/lock')

// Create our custom options
const customRepositoryOptions = {

  /**
   * IPFS nodes store different information in separate storageBackends, or datastores.
   * Each storage backend can use the same type of datastore or a different one — you
   * could store your keys in a levelDB database while everything else is in files,
   * for example. (See https://github.com/ipfs/interface-datastore for more about datastores.)
   */
  storageBackends: {
    root: require('datastore-fs'), // version and config data will be saved here
    blocks: require('datastore-fs'),
    keys: require('datastore-fs'),
    datastore: require('datastore-fs')
  },

  /**
   * Storage Backend Options will get passed into the instantiation of their counterpart
   * in `storageBackends`. If you create a custom datastore, this is where you can pass in
   * custom constructor arguments. You can see an S3 datastore example at:
   * https://github.com/ipfs/js-datastore-s3/tree/master/examples/full-s3-repo
   *
   * NOTE: The following options are being overriden for demonstration purposes only.
   * In most instances you can simply use the default options, by not passing in any
   * overrides, which is recommended if you have no need to override.
   */
  storageBackendOptions: {
    root: {
      extension: '.ipfsroot', // Defaults to ''. Used by datastore-fs; Appended to all files
      errorIfExists: false, // Used by datastore-fs; If the datastore exists, don't throw an error
      createIfMissing: true // Used by datastore-fs; If the datastore doesn't exist yet, create it
    },
    blocks: {
      sharding: false, // Used by IPFSRepo Blockstore to determine sharding; Ignored by datastore-fs
      extension: '.ipfsblock', // Defaults to '.data'.
      errorIfExists: false,
      createIfMissing: true
    },
    keys: {
      extension: '.ipfskey', // No extension by default
      errorIfExists: false,
      createIfMissing: true
    },
    datastore: {
      extension: '.ipfsds', // No extension by default
      errorIfExists: false,
      createIfMissing: true
    }
  },

  /**
   * A custom lock can be added here. Or the build in Repo `fs` or `memory` locks can be used.
   * See https://github.com/ipfs/js-ipfs-repo for more details on setting the lock.
   */
  lock: fsLock
}

// Initialize our IPFS node with the custom repo options
const node = new IPFS({
  repo: new Repo('/tmp/custom-repo/.ipfs', customRepositoryOptions)
})

// Test the new repo by adding and fetching some data
node.on('ready', () => {
  console.log('Ready')
  node.version()
    .then((version) => {
      console.log('Version:', version.version)
    })
    // Once we have the version, let's add a file to IPFS
    .then(() => {
      return node.files.add({
        path: 'test-data.txt',
        content: Buffer.from('We are using a customized repo!')
      })
    })
    // Log out the added files metadata and cat the file from IPFS
    .then((filesAdded) => {
      console.log('\nAdded file:', filesAdded[0].path, filesAdded[0].hash)
      return node.files.cat(filesAdded[0].hash)
    })
    // Print out the files contents to console
    .then((data) => {
      console.log('\nFetched file content:')
      process.stdout.write(data)
    })
    // Log out the error, if there is one
    .catch((err) => {
      console.log('File Processing Error:', err)
    })
    // After everything is done, shut the node down
    // We don't need to worry about catching errors here
    .then(() => {
      console.log('\n\nStopping the node')
      return node.stop()
    })
    // Let users know where they can inspect the repo
    .then(() => {
      console.log('Check "/tmp/custom-repo/.ipfs" to see what your customized repository looks like on disk.')
    })
})
