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

module.exports = (ipfs) => {
  const mfs = {}

  Object.keys(readOperations).forEach(key => {
    if (readOperations.hasOwnProperty(key)) {
      mfs[key] = promisify(lock.readLock(readOperations[key](ipfs)))
    }
  })

  Object.keys(writeOperations).forEach(key => {
    if (writeOperations.hasOwnProperty(key)) {
      mfs[key] = promisify(lock.writeLock(writeOperations[key](ipfs)))
    }
  })

  return mfs
}
