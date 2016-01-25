/* globals describe, before */

// const expect = require('chai').expect
const async = require('async')
const store = require('local-storage-blob-store')
const _ = require('lodash')

var repoContext = require.context('raw!../repo-example', true)

describe('core', function () {
  before(function (done) {
    window.localStorage.clear()

    var repoData = []
    repoContext.keys().forEach(function (key) {
      console.log(key)
      repoData.push({
        key: key.replace('./', ''),
        value: repoContext(key)
      })
    })

    var mainBlob = store('ipfs')
    var blocksBlob = store('ipfs/')

    async.eachSeries(repoData, (file, cb) => {
      if (_.startsWith(file.key, 'datastore/')) {
        return cb()
      }

      const blob = _.startsWith(file.key, 'blocks/')
        ? blocksBlob
        : mainBlob

      blob.createWriteStream({
        key: file.key
      }).end(file.value, cb)
    }, done)
  })

  const testsContext = require.context('.', true, /test-*/)
  testsContext
    .keys()
    .forEach(key => testsContext(key))
})
