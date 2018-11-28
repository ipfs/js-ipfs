'use strict'

const assert = require('assert')
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
  readReadableStream: require('./read-readable-stream'),
  lsPullStream: require('./ls-pull-stream'),
  lsReadableStream: require('./ls-readable-stream')
}

const wrap = ({
  options, mfs, operations, lock
}) => {
  Object.keys(operations).forEach(key => {
    mfs[key] = promisify(lock(operations[key](options)))
  })
}

const defaultOptions = {
  repoOwner: true,
  ipld: null,
  repo: null
}

module.exports = (options) => {
  const {
    repoOwner
  } = Object.assign({}, defaultOptions || {}, options)

  assert(options.ipld, 'MFS requires an IPLD instance')
  assert(options.repo, 'MFS requires an ipfs-repo instance')

  const lock = createLock(repoOwner)

  const readLock = (operation) => {
    return lock.readLock(operation)
  }

  const writeLock = (operation) => {
    return lock.writeLock(operation)
  }

  const mfs = {}

  wrap({
    options, mfs, operations: readOperations, lock: readLock
  })
  wrap({
    options, mfs, operations: writeOperations, lock: writeLock
  })

  Object.keys(unwrappedOperations).forEach(key => {
    mfs[key] = promisify(unwrappedOperations[key](options))
  })

  Object.keys(unwrappedSynchronousOperations).forEach(key => {
    mfs[key] = unwrappedSynchronousOperations[key](options)
  })

  return mfs
}
