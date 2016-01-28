/* globals describe, before */

const async = require('async')
const store = require('idb-plus-blob-store')
const _ = require('lodash')

const repoContext = require.context('buffer!./../repo-example', true)

const idb = window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB

idb.deleteDatabase('ipfs')
idb.deleteDatabase('ipfs/blocks')

describe('IPFS Repo Tests on the Browser', function () {
  before(function (done) {
    var repoData = []
    repoContext.keys().forEach(function (key) {
      repoData.push({
        key: key.replace('./', ''),
        value: repoContext(key)
      })
    })

    const mainBlob = store('ipfs')
    const blocksBlob = store('ipfs/blocks')

    async.eachSeries(repoData, (file, cb) => {
      if (_.startsWith(file.key, 'datastore/')) {
        return cb()
      }

      const blocks = _.startsWith(file.key, 'blocks/')
      const blob = blocks ? blocksBlob : mainBlob

      const key = blocks ? file.key.replace(/^blocks\//, '') : file.key

      blob.createWriteStream({
        key: key
      }).end(file.value, cb)
    }, done)
  })

  const testsContext = require.context('.', true, /test-*/)
  testsContext
    .keys()
    .forEach(key => testsContext(key))
})
