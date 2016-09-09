/* eslint-env mocha */
'use strict'

const series = require('run-series')
const Store = require('idb-pull-blob-store')
const _ = require('lodash')
const pull = require('pull-stream')

const repoContext = require.context('buffer!./../go-ipfs-repo', true)

const idb = window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB

idb.deleteDatabase('ipfs')
idb.deleteDatabase('ipfs/blocks')

describe('core', function () {
  this.timeout(10000)
  before(function (done) {
    var repoData = []
    repoContext.keys().forEach(function (key) {
      repoData.push({
        key: key.replace('./', ''),
        value: repoContext(key)
      })
    })

    const mainBlob = new Store('ipfs')
    const blocksBlob = new Store('ipfs/blocks')

    series(repoData.map((file) => (cb) => {
      if (_.startsWith(file.key, 'datastore/')) {
        return cb()
      }

      const blocks = _.startsWith(file.key, 'blocks/')
      const blob = blocks ? blocksBlob : mainBlob
      const key = blocks ? file.key.replace(/^blocks\//, '') : file.key

      pull(
        pull.values([file.value]),
        blob.write(key, cb)
      )
    }), done)
  })

  require('./both')
  require('./browser-only')
})
