'use strict'

const createLock = require('./utils/create-lock')
const isIpfs = require('is-ipfs')

/**
 * @typedef {Object} MFS
 * @property {ReturnType<typeof import('./stat')>} stat
 * @property {ReturnType<typeof import('./chmod')>} chmod
 * @property {ReturnType<typeof import('./cp')>} cp
 * @property {ReturnType<typeof import('./flush')>} flush
 * @property {ReturnType<typeof import('./mkdir')>} mkdir
 * @property {ReturnType<typeof import('./mv')>} mv
 * @property {ReturnType<typeof import('./rm')>} rm
 * @property {ReturnType<typeof import('./touch')>} touch
 * @property {ReturnType<typeof import('./write')>} write
 * @property {ReturnType<typeof import('./read')>} read
 * @property {ReturnType<typeof import('./ls')>} ls
 */

// These operations are read-locked at the function level and will execute simultaneously
const readOperations = {
  stat: require('./stat')
}

// These operations are locked at the function level and will execute in series
const writeOperations = {
  chmod: require('./chmod'),
  cp: require('./cp'),
  flush: require('./flush'),
  mkdir: require('./mkdir'),
  mv: require('./mv'),
  rm: require('./rm'),
  touch: require('./touch')
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

function createMfs (options) {
  const {
    repoOwner
  } = Object.assign({}, defaultOptions || {}, options)

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

/**
 * @param {Object} context
 * @param {import('..').IPLD} context.ipld
 * @param {import('..').Block} context.block
 * @param {import('..').BlockService} context.blockService
 * @param {import('..').Repo} context.repo
 * @param {import('..').Preload} context.preload
 * @param {import('..').Options} context.options
 * @returns {MFS}
 */
module.exports = ({ ipld, block, blockService, repo, preload, options: constructorOptions }) => {
  const methods = createMfs({
    ipld,
    block,
    blocks: blockService,
    datastore: repo.root,
    repoOwner: constructorOptions.repoOwner
  })

  const withPreload = fn => (...args) => {
    const paths = args.filter(arg => isIpfs.ipfsPath(arg) || isIpfs.cid(arg))

    if (paths.length) {
      const options = args[args.length - 1]
      if (options && options.preload !== false) {
        paths.forEach(path => preload(path))
      }
    }

    return fn(...args)
  }

  return {
    ...methods,
    chmod: methods.chmod,
    cp: withPreload(methods.cp),
    mkdir: methods.mkdir,
    stat: withPreload(methods.stat),
    rm: methods.rm,
    read: withPreload(methods.read),
    touch: methods.touch,
    write: methods.write,
    mv: withPreload(methods.mv),
    flush: methods.flush,
    ls: withPreload(async function * (...args) {
      for await (const file of methods.ls(...args)) {
        yield { ...file, size: file.size || 0 }
      }
    })
  }
}
