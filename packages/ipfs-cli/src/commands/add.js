/* eslint-disable complexity */

import { promisify } from 'util'
// @ts-expect-error no types
import getFolderSizeCb from 'get-folder-size'
// @ts-expect-error no types
import byteman from 'byteman'
import {
  createProgressBar,
  coerceMtime,
  coerceMtimeNsecs,
  stripControlCharacters
} from '../utils.js'
import globSource from 'ipfs-utils/src/files/glob-source.js'
import parseDuration from 'parse-duration'
import merge from 'it-merge'
import fs from 'fs'
import path from 'path'

const getFolderSize = promisify(getFolderSizeCb)

/**
 * @param {string[]} paths
 */
async function getTotalBytes (paths) {
  const sizes = await Promise.all(paths.map(p => getFolderSize(p)))
  return sizes.reduce((total, size) => total + size, 0)
}

/**
 * @param {string} target
 * @param {object} options
 * @param {boolean} [options.recursive]
 * @param {boolean} [options.hidden]
 * @param {boolean} [options.preserveMode]
 * @param {boolean} [options.preserveMtime]
 * @param {number} [options.mode]
 * @param {import('ipfs-unixfs').MtimeLike} [options.mtime]
 */
async function * getSource (target, options = {}) {
  const absolutePath = path.resolve(target)
  const stats = await fs.promises.stat(absolutePath)

  if (stats.isFile()) {
    let mtime = options.mtime
    let mode = options.mode

    if (options.preserveMtime) {
      mtime = stats.mtime
    }

    if (options.preserveMode) {
      mode = stats.mode
    }

    yield {
      path: path.basename(target),
      content: fs.createReadStream(absolutePath),
      mtime,
      mode
    }

    return
  }

  const dirName = path.basename(absolutePath)

  let pattern = '*'

  if (options.recursive) {
    pattern = '**/*'
  }

  for await (const content of globSource(target, pattern, {
    hidden: options.hidden,
    preserveMode: options.preserveMode,
    preserveMtime: options.preserveMtime,
    mode: options.mode,
    mtime: options.mtime
  })) {
    yield {
      ...content,
      path: `${dirName}${content.path}`
    }
  }
}

export default {
  command: 'add [file...]',

  describe: 'Add a file to IPFS using the UnixFS data format',

  builder: {
    progress: {
      alias: 'p',
      type: 'boolean',
      default: true,
      describe: 'Stream progress data'
    },
    recursive: {
      alias: 'r',
      type: 'boolean',
      default: false
    },
    trickle: {
      alias: 't',
      type: 'boolean',
      default: false,
      describe: 'Use the trickle DAG builder'
    },
    'wrap-with-directory': {
      alias: 'w',
      type: 'boolean',
      default: false,
      describe: 'Add a wrapping node'
    },
    'only-hash': {
      alias: 'n',
      type: 'boolean',
      default: false,
      describe: 'Only chunk and hash, do not write'
    },
    'block-write-concurrency': {
      type: 'integer',
      default: 10,
      describe: 'After a file has been chunked, this controls how many chunks to hash and add to the block store concurrently'
    },
    chunker: {
      default: 'size-262144',
      describe: 'Chunking algorithm to use, formatted like [size-{size}, rabin, rabin-{avg}, rabin-{min}-{avg}-{max}]'
    },
    'file-import-concurrency': {
      type: 'integer',
      default: 50,
      describe: 'How many files to import at once'
    },
    'enable-sharding-experiment': {
      type: 'boolean',
      default: false
    },
    'shard-split-threshold': {
      type: 'integer',
      default: 1000
    },
    'raw-leaves': {
      type: 'boolean',
      describe: 'Use raw blocks for leaf nodes. (experimental)'
    },
    'cid-version': {
      type: 'integer',
      describe: 'CID version. Defaults to 0 unless an option that depends on CIDv1 is passed. (experimental)',
      default: 0
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      default: 'base58btc'
    },
    hash: {
      type: 'string',
      describe: 'Hash function to use. Will set CID version to 1 if used. (experimental)',
      default: 'sha2-256'
    },
    quiet: {
      alias: 'q',
      type: 'boolean',
      default: false,
      describe: 'Write minimal output'
    },
    quieter: {
      alias: 'Q',
      type: 'boolean',
      default: false,
      describe: 'Write only final hash'
    },
    silent: {
      type: 'boolean',
      default: false,
      describe: 'Write no output'
    },
    pin: {
      type: 'boolean',
      default: true,
      describe: 'Pin this object when adding'
    },
    preload: {
      type: 'boolean',
      default: true,
      describe: 'Preload this object when adding'
    },
    hidden: {
      alias: 'H',
      type: 'boolean',
      default: false,
      describe: 'Include files that are hidden. Only takes effect on recursive add.'
    },
    'preserve-mode': {
      type: 'boolean',
      default: false,
      describe: 'Apply permissions to created UnixFS entries'
    },
    'preserve-mtime': {
      type: 'boolean',
      default: false,
      describe: 'Apply modification time to created UnixFS entries'
    },
    mode: {
      type: 'string',
      describe: 'File mode to apply to created UnixFS entries'
    },
    mtime: {
      type: 'number',
      coerce: coerceMtime,
      describe: 'Modification time in seconds before or since the Unix Epoch to apply to created UnixFS entries'
    },
    'mtime-nsecs': {
      type: 'number',
      coerce: coerceMtimeNsecs,
      describe: 'Modification time fraction in nanoseconds'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../types').Context} argv.ctx
   * @param {boolean} argv.trickle
   * @param {number} argv.shardSplitThreshold
   * @param {import('multiformats/cid').CIDVersion} argv.cidVersion
   * @param {boolean} argv.rawLeaves
   * @param {boolean} argv.onlyHash
   * @param {string} argv.hash
   * @param {boolean} argv.wrapWithDirectory
   * @param {boolean} argv.pin
   * @param {string} argv.chunker
   * @param {boolean} argv.preload
   * @param {number} argv.fileImportConcurrency
   * @param {number} argv.blockWriteConcurrency
   * @param {number} argv.timeout
   * @param {boolean} argv.quieter
   * @param {boolean} argv.quiet
   * @param {boolean} argv.silent
   * @param {boolean} argv.progress
   * @param {string[]} argv.file
   * @param {number} argv.mtime
   * @param {number} argv.mtimeNsecs
   * @param {boolean} argv.recursive
   * @param {boolean} argv.hidden
   * @param {boolean} argv.preserveMode
   * @param {boolean} argv.preserveMtime
   * @param {number} argv.mode
   * @param {string} argv.cidBase
   * @param {boolean} argv.enableShardingExperiment
   */
  async handler ({
    ctx: { ipfs, print, isDaemon, getStdin },
    trickle,
    shardSplitThreshold,
    cidVersion,
    rawLeaves,
    onlyHash,
    hash,
    wrapWithDirectory,
    pin,
    chunker,
    preload,
    fileImportConcurrency,
    blockWriteConcurrency,
    timeout,
    quieter,
    quiet,
    silent,
    progress,
    file,
    mtime,
    mtimeNsecs,
    recursive,
    hidden,
    preserveMode,
    preserveMtime,
    mode,
    cidBase,
    enableShardingExperiment
  }) {
    const options = {
      trickle,
      shardSplitThreshold,
      cidVersion,
      rawLeaves,
      onlyHash,
      hashAlg: hash,
      wrapWithDirectory,
      pin,
      chunker,
      preload,
      fileImportConcurrency,
      blockWriteConcurrency,
      /**
       * @type {import('ipfs-core-types/src/root').AddProgressFn}
       */
      progress: (bytes, name) => {},
      timeout
    }

    if (enableShardingExperiment && isDaemon) {
      throw new Error('Error: Enabling the sharding experiment should be done on the daemon')
    }

    /** @type {{update: Function, interrupt: Function, terminate: Function} | undefined} */
    let bar
    let log = print

    if (quieter || quiet || silent) {
      progress = false
    }

    if (progress && file) {
      const totalBytes = await getTotalBytes(file)
      bar = createProgressBar(totalBytes, print)

      if (print.isTTY) {
        // bar.interrupt uses clearLine and cursorTo methods that are only on TTYs
        log = bar.interrupt.bind(bar)
      }

      /**
       * @param {number} byteLength
       */
      options.progress = byteLength => {
        if (bar) {
          bar.update(byteLength / totalBytes, { progress: byteman(byteLength, 2, 'MB') })
        }
      }
    }

    if (options.rawLeaves == null) {
      options.rawLeaves = cidVersion > 0
    }

    /** @type {{ secs: number, nsecs?: number } | undefined} */
    let date

    if (mtime) {
      date = { secs: mtime, nsecs: mtimeNsecs }
    }

    const source = file
      ? merge(...file.map(file => getSource(file, {
        hidden,
        recursive,
        preserveMode,
        preserveMtime,
        mode,
        mtime: date
      })))
      : [{
          content: getStdin(),
          mode,
          mtime: date
        }] // Pipe to ipfs.add tagging with mode and mtime

    let finalCid
    const base = await ipfs.bases.getBase(cidBase)

    try {
      for await (const { cid, path } of ipfs.addAll(source, options)) {
        if (silent) {
          continue
        }

        if (quieter) {
          finalCid = cid
          continue
        }

        const pathStr = stripControlCharacters(path)
        const cidStr = cid.toString(base.encoder)
        let message = cidStr

        if (!quiet) {
          // print the hash twice if we are piping from stdin
          message = `added ${cidStr} ${file ? pathStr || '' : cidStr}`.trim()
        }

        log(message)
      }
    } catch (/** @type {any} */ err) {
      // Tweak the error message and add more relevant info for the CLI
      if (err.code === 'ERR_DIR_NON_RECURSIVE') {
        err.message = `'${err.path}' is a directory, use the '-r' flag to specify directories`
      }

      throw err
    } finally {
      if (bar) {
        bar.terminate()
      }
    }

    if (quieter && finalCid) {
      log(finalCid.toString(base.encoder))
    }
  }
}
