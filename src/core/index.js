'use strict'

const promisify = require('promisify-es6')
const {
  lock
} = require('./utils')

const readOperations = {
  ls: require('./ls'),
  read: require('./read'),
  readPullStream: require('./read-pull-stream'),
  readReadableStream: require('./read-readable-stream'),
  stat: require('./stat')
}

const writeOperations = {
  cp: require('./cp'),
  flush: require('./flush'),
  mkdir: require('./mkdir'),
  mv: require('./mv'),
  rm: require('./rm'),
  write: require('./write')
}

const wrap = (ipfs, mfs, operations, lock) => {
  Object.keys(operations).forEach(key => {
    if (operations.hasOwnProperty(key)) {
      mfs[key] = promisify(lock(operations[key](ipfs)))
    }
  })
}

const readLock = (operation) => {
  return lock.readLock(operation)
}

const writeLock = (operation) => {
  return lock.writeLock(operation)
}

const noLock = (operation) => {
  return operation
}

module.exports = (ipfs) => {
  const mfs = {}

  wrap(ipfs, mfs, readOperations, global.MFS_DISABLE_CONCURRENCY ? noLock : readLock)
  wrap(ipfs, mfs, writeOperations, global.MFS_DISABLE_CONCURRENCY ? noLock : writeLock)

  return mfs
}
