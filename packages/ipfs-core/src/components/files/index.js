import { createLock } from './utils/create-lock.js'
import isIpfs from 'is-ipfs'
import { createStat } from './stat.js'
import { createChmod } from './chmod.js'
import { createCp } from './cp.js'
import { createFlush } from './flush.js'
import { createMkdir } from './mkdir.js'
import { createMv } from './mv.js'
import { createRm } from './rm.js'
import { createTouch } from './touch.js'
import { createRead } from './read.js'
import { createWrite } from './write.js'
import { createLs } from './ls.js'

/**
 * @typedef {import('multiformats/hashes/interface').MultihashHasher} MultihashHasher
 * @typedef {import('ipfs-core-utils/multihashes').Multihashes} Multihashes
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
  stat: createStat
}

/**
 * These operations are locked at the function level and will execute in series
 *
 * @type {Record<string, any>}
 */
const writeOperations = {
  chmod: createChmod,
  cp: createCp,
  flush: createFlush,
  mkdir: createMkdir,
  mv: createMv,
  rm: createRm,
  touch: createTouch
}

/**
 * These operations are asynchronous and manage their own locking
 *
 * @type {Record<string, any>}
 */
const unwrappedOperations = {
  write: createWrite,
  read: createRead,
  ls: createLs
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
export function createFiles ({ repo, preload, hashers, options: constructorOptions }) {
  const methods = createMfs({
    repo,
    repoOwner: constructorOptions.repoOwner !== false,
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
      const paths = args.filter(arg => isIpfs.ipfsPath(arg) || isIpfs.cid(arg))

      if (paths.length) {
        const options = args[args.length - 1]
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
