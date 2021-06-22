/* global self */
'use strict'

const IPFSRepo = require('ipfs-repo')
const { nanoid } = require('nanoid')

const idb = self.indexedDB ||
  self.mozIndexedDB ||
  self.webkitIndexedDB ||
  self.msIndexedDB

/**
 * @param {object} options
 * @param {string} [options.path]
 * @param {number} [options.version]
 * @param {number} [options.spec]
 * @param {import('ipfs-core-types/src/config').Config} [options.config]
 */
module.exports = async function createTempRepo (options = {}) {
  options.path = options.path || `ipfs-${nanoid()}`

  await createDB(options.path, (objectStore) => {
    const encoder = new TextEncoder()

    if (options.version) {
      objectStore.put(encoder.encode(`${options.version}`), '/version')
    }

    if (options.spec) {
      objectStore.put(encoder.encode(`${options.spec}`), '/datastore_spec')
    }

    if (options.config) {
      objectStore.put(encoder.encode(JSON.stringify(options.config)), '/config')
    }
  })

  const repo = new IPFSRepo(options.path)

  repo.teardown = async () => {
    try {
      await repo.close()
    } catch (err) {
      if (!err.message.includes('already closed')) {
        throw err
      }
    }

    idb.deleteDatabase(options.path)
    idb.deleteDatabase(options.path + '/blocks')
  }

  return repo
}

/**
 * Allows pre-filling the root IndexedDB object store with data
 *
 * @param {string} path
 * @param {(objectStore: IDBObjectStore) => void} fn
 */
function createDB (path, fn) {
  return new Promise((resolve, reject) => {
    const request = idb.open(path, 1)

    request.onupgradeneeded = () => {
      const db = request.result

      db.onerror = () => {
        reject(new Error('Could not create database'))
      }

      db.createObjectStore(path)
    }

    request.onsuccess = () => {
      const db = request.result

      const transaction = db.transaction(path, 'readwrite')
      transaction.onerror = () => {
        reject(new Error('Could not add data to database'))
      }
      transaction.oncomplete = () => {
        db.close()
        resolve()
      }

      const objectStore = transaction.objectStore(path)

      fn(objectStore)

      transaction.commit()
    }
  })
}
