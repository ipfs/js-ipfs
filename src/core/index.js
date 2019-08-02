'use strict'

const assert = require('assert')
const createLock = require('./utils/create-lock')

// These operations are read-locked at the function level and will execute simultaneously
const readOperations = {
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
  read: require('./read'),
  ls: require('./ls')
}

const wrap = ({
  options, mfs, operations, lock
}) => {
  Object.keys(operations).forEach(key => {
    mfs[key] = lock(operations[key](options))
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
  assert(options.blocks, 'MFS requires an BlockStore instance')
  assert(options.datastore, 'MFS requires a DataStore instance')

  options.repo = {
    blocks: options.blocks,
    datastore: options.datastore
  }

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
    mfs[key] = unwrappedOperations[key](options)
  })

  return mfs
}
