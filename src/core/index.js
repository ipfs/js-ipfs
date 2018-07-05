'use strict'

const promisify = require('promisify-es6')
const {
  createLock
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

const defaultOptions = {
  repoOwner: true
}

module.exports = (ipfs, options) => {
  const {
    repoOwner
  } = Object.assign({}, defaultOptions || {}, options)

  const lock = createLock(repoOwner)

  const readLock = (operation) => {
    return lock.readLock(operation)
  }

  const writeLock = (operation) => {
    return lock.writeLock(operation)
  }

  const mfs = {}

  wrap(ipfs, mfs, readOperations, readLock)
  wrap(ipfs, mfs, writeOperations, writeLock)

  return mfs
}
