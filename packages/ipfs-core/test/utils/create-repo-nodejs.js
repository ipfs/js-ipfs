'use strict'

const IPFSRepo = require('ipfs-repo')
const clean = require('./clean')
const os = require('os')
const path = require('path')
const { nanoid } = require('nanoid')
const fs = require('fs').promises

/**
 * @param {object} options
 * @param {string} [options.path]
 * @param {number} [options.version]
 * @param {number} [options.spec]
 * @param {import('ipfs-core-types/src/config').Config} [options.config]
 */
module.exports = async function createTempRepo (options = {}) {
  options.path = options.path || path.join(os.tmpdir(), '/ipfs-test-' + nanoid())

  await fs.mkdir(options.path)

  if (options.version) {
    await fs.writeFile(path.join(options.path, 'version'), `${options.version}`)
  }

  if (options.spec) {
    await fs.writeFile(path.join(options.path, 'spec'), `${options.spec}`)
  }

  if (options.config) {
    await fs.writeFile(path.join(options.path, 'config'), JSON.stringify(options.config))
  }

  const repo = new IPFSRepo(options.path)

  repo.teardown = async () => {
    try {
      await repo.close()
    } catch (err) {
      if (!err.message.includes('already closed')) {
        throw err
      }
    }

    await clean(options.path)
  }

  return repo
}
