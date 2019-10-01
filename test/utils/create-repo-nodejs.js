'use strict'

const IPFSRepo = require('ipfs-repo')
const clean = require('./clean')
const os = require('os')
const path = require('path')
const hat = require('hat')
const callbackify = require('callbackify')

function createTempRepo (repoPath) {
  repoPath = repoPath || path.join(os.tmpdir(), '/ipfs-test-' + hat())

  const repo = new IPFSRepo(repoPath)

  repo.teardown = callbackify(async () => {
    try {
      await repo.close()
    } catch (err) {
      if (!err.message.includes('already closed')) {
        throw err
      }
    }

    await clean(repoPath)
  })

  return repo
}

module.exports = createTempRepo
