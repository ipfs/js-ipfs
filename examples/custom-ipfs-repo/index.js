'use strict'

const series = require('async/series')
const IPFS = require('ipfs')
const Repo = require('ipfs-repo')

// Create our custom options
const customRepositoryOptions = {

  /**
   * Storage Backends are fully customizable. Each backend can be stored in seperate services,
   * or in a single service. Options can be passed into the datastores via the storageBackendOptions
   * property shown below.
   */
  storageBackends: {
    root: require('datastore-fs'), // version and config data will be saved here
    blocks: require('datastore-fs'),
    keys: require('datastore-fs'),
    datastore: require('datastore-fs')
  },

  /**
   * Storage Backend Options will get passed into the instantiation of their counterpart
   * in Storage Backends. If you create a custom datastore, this is where you can pass in
   * custom insantiation. You can see an S3 datastore example at:
   * https://github.com/ipfs/js-datastore-s3/tree/master/examples/full-s3-repo
   */
  storageBackendOptions: {
    blocks: {
      sharding: true,
      extension: '.data'
    }
  },

  // false will disable locking, you can also pass in a custom locker
  locker: false
}

// Initialize our repo and IPFS node
const myRepo = new Repo('/tmp/custom-repo/.ipfs', customRepositoryOptions)
const node = new IPFS({
  repo: myRepo
})

// Test the new repo by adding and fetching some data
let fileMultihash
series([
  (cb) => node.on('ready', cb),
  (cb) => node.version((err, version) => {
    if (err) {
      return cb(err)
    }

    console.log('Version:', version.version)
    cb()
  }),
  (cb) => node.files.add({
    path: 'test-data.txt',
    content: Buffer.from('We are using a customized repo!')
  }, (err, filesAdded) => {
    if (err) {
      return cb(err)
    }

    console.log('\nAdded file:', filesAdded[0].path, filesAdded[0].hash)
    fileMultihash = filesAdded[0].hash
    cb()
  }),
  (cb) => node.files.cat(fileMultihash, (err, data) => {
    if (err) {
      return cb(err)
    }

    console.log('\nFetched file content:')
    process.stdout.write(data)
    cb()
  })
])
