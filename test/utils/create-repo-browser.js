/* global self */
'use strict'

const IPFSRepo = require('ipfs-repo')
const hat = require('hat')

const idb = self.indexedDB ||
  self.mozIndexedDB ||
  self.webkitIndexedDB ||
  self.msIndexedDB

module.exports = function createTempRepo (repoPath) {
  repoPath = repoPath || '/ipfs-' + hat()

  const repo = new IPFSRepo(repoPath)

  repo.teardown = async () => {
    try {
      await repo.close()
    } catch (err) {
      if (!err.message.includes('already closed')) {
        throw err
      }
    }

    idb.deleteDatabase(repoPath)
    idb.deleteDatabase(repoPath + '/blocks')
  }

  return repo
}
