/* global self */
'use strict'

const IPFSRepo = require('ipfs-repo')
const hat = require('hat')
const callbackify = require('callbackify')

const idb = self.indexedDB ||
  self.mozIndexedDB ||
  self.webkitIndexedDB ||
  self.msIndexedDB

function createTempRepo (repoPath) {
  repoPath = repoPath || '/ipfs-' + hat()

  const repo = new IPFSRepo(repoPath)

  repo.teardown = callbackify(async () => {
    try {
      await repo.close()
    } catch (err) {
      if (!err.message.includes('already closed')) {
        throw err
      }
    }

    idb.deleteDatabase(repoPath)
    idb.deleteDatabase(repoPath + '/blocks')
  })

  return repo
}

module.exports = createTempRepo
