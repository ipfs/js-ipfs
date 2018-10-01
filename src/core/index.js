'use strict'

const promisify = require('promisify-es6')
const {
  createLock
} = require('./utils')

// These operations are read-locked at the function level and will execute simultaneously
const readOperations = {
  ls: require('./ls'),
  stat: require('./stat')
}

// These operations are locked at the function level and will execute in series
const writeOperations = {
  cp: require('./cp'),
  flush: require('./flush'),
  mkdir: require('./mkdir'),
  mv: require('./mv'),
  rm: require('./rm')
}

// These operations are asynchronous and manage their own locking
const unwrappedOperations = {
  write: require('./write'),
  read: require('./read')
}

// These operations are synchronous and manage their own locking
const unwrappedSynchronousOperations = {
  readPullStream: require('./read-pull-stream'),
  readReadableStream: require('./read-readable-stream')
}

const wrap = ({
  ipfs, mfs, operations, lock
}) => {
  Object.keys(operations).forEach(key => {
    mfs[key] = promisify(lock(operations[key](ipfs)))
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

  wrap({
    ipfs, mfs, operations: readOperations, lock: readLock
  })
  wrap({
    ipfs, mfs, operations: writeOperations, lock: writeLock
  })

  Object.keys(unwrappedOperations).forEach(key => {
    mfs[key] = promisify(unwrappedOperations[key](ipfs))
  })

  Object.keys(unwrappedSynchronousOperations).forEach(key => {
    mfs[key] = unwrappedSynchronousOperations[key](ipfs)
  })

  return mfs
}
