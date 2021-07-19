'use strict'

const createLock = require('./utils/create-lock')
const isIpfs = require('is-ipfs')

/**
 * @typedef {import('multiformats/hashes/interface').MultihashHasher} MultihashHasher
 * @typedef {import('ipfs-core-utils/src/multihashes')} Multihashes
 * @typedef {import('ipfs-repo').IPFSRepo} IPFSRepo
 *
 * @typedef {object} MfsContext
 * @property {IPFSRepo} repo
 * @property {Multihashes} hashers
 */

/**
 * These operations are read-locked at the function level and will execute simultaneously
 *
 * @type {Record<string, any>}
 */
const readOperations = {
  stat: require('./stat')
}

/**
 * These operations are locked at the function level and will execute in series
 *
 * @type {Record<string, any>}
 */
const writeOperations = {
  chmod: require('./chmod'),
  cp: require('./cp'),
  flush: require('./flush'),
  mkdir: require('./mkdir'),
  mv: require('./mv'),
  rm: require('./rm'),
  touch: require('./touch')
}

/**
 * These operations are asynchronous and manage their own locking
 *
 * @type {Record<string, any>}
 */
const unwrappedOperations = {
  write: require('./write'),
  read: require('./read'),
  ls: require('./ls')
}

/**
 * @param {object} arg
 * @param {MfsContext} arg.options
 * @param {*} arg.mfs
 * @param {*} arg.operations
 * @param {*} arg.lock
 */
const wrap = ({
  options, mfs, operations, lock
}) => {
  Object.keys(operations).forEach(key => {
    mfs[key] = lock(operations[key](options))
  })
}

const defaultOptions = {
  repoOwner: true,
  repo: null
}

/**
 * @param {object} options
 * @param {IPFSRepo} options.repo
 * @param {boolean} options.repoOwner
 * @param {Multihashes} options.hashers
 */
function createMfs (options) {
  const {
    repoOwner
  } = Object.assign({}, defaultOptions || {}, options)

  const lock = createLock(repoOwner)

  /**
   * @param {(fn: (...args: any) => any) => (...args: any) => any} operation
   */
  const readLock = (operation) => {
    return lock.readLock(operation)
  }

  /**
   * @param {(fn: (...args: any) => any) => (...args: any) => any} operation
   */
  const writeLock = (operation) => {
    return lock.writeLock(operation)
  }

  /** @type {Record<string, any>} */
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
 * @param {object} context
 * @param {IPFSRepo} context.repo
 * @param {import('../../types').Preload} context.preload
 * @param {import('..').Options} context.options
 * @param {Multihashes} context.hashers
 * @returns {import('ipfs-core-types/src/files').API}
 */
module.exports = ({ repo, preload, hashers, options: constructorOptions }) => {
  const methods = createMfs({
    repo,
    repoOwner: Boolean(constructorOptions.repoOwner),
    hashers
  })

  /**
   * @param {any} fn
   */
  const withPreload = fn => {
    /**
     * @param  {...any} args
     */
    const wrapped = (...args) => {
      // @ts-ignore cannot derive type of arg
      const paths = args.filter(arg => isIpfs.ipfsPath(arg) || isIpfs.cid(arg))

      if (paths.length) {
        const options = args[args.length - 1]
        // @ts-ignore it's a PreloadOptions, honest
        if (options && options.preload !== false) {
          paths.forEach(path => preload(path))
        }
      }

      return fn(...args)
    }

    return wrapped
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
    ls: withPreload(async function * (/** @type {...any} */ ...args) {
      for await (const file of methods.ls(...args)) {
        yield { ...file, size: file.size || 0 }
      }
    })
  }
}
