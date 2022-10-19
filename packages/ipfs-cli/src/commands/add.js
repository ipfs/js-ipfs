/* eslint-disable complexity */

import getFolderSize from 'get-folder-size'
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

/**
 * @param {string[]} paths
 */
async function getTotalBytes (paths) {
  const sizes = await Promise.all(paths.map(p => getFolderSize(p)))
  return sizes.reduce((total, { size }) => total + size, 0)
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

/**
 * @typedef {object} Argv
 * @property {import('../types').Context} Argv.ctx
 * @property {boolean} Argv.trickle
 * @property {number} Argv.shardSplitThreshold
 * @property {import('multiformats/cid').Version} Argv.cidVersion
 * @property {boolean} Argv.rawLeaves
 * @property {boolean} Argv.onlyHash
 * @property {string} Argv.hash
 * @property {boolean} Argv.wrapWithDirectory
 * @property {boolean} Argv.pin
 * @property {string} Argv.chunker
 * @property {boolean} Argv.preload
 * @property {number} Argv.fileImportConcurrency
 * @property {number} Argv.blockWriteConcurrency
 * @property {number} Argv.timeout
 * @property {boolean} Argv.quieter
 * @property {boolean} Argv.quiet
 * @property {boolean} Argv.silent
 * @property {boolean} Argv.progress
 * @property {string[]} Argv.file
 * @property {number} Argv.mtime
 * @property {number} Argv.mtimeNsecs
 * @property {boolean} Argv.recursive
 * @property {boolean} Argv.hidden
 * @property {boolean} Argv.preserveMode
 * @property {boolean} Argv.preserveMtime
 * @property {number} Argv.mode
 * @property {string} Argv.cidBase
 * @property {boolean} Argv.enableShardingExperiment
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'add [file...]',

  describe: 'Add a file to IPFS using the UnixFS data format',

  builder: {
    progress: {
      alias: 'p',
      boolean: true,
      default: true,
      describe: 'Stream progress data'
    },
    recursive: {
      alias: 'r',
      boolean: true,
      default: false
    },
    trickle: {
      alias: 't',
      boolean: true,
      default: false,
      describe: 'Use the trickle DAG builder'
    },
    'wrap-with-directory': {
      alias: 'w',
      boolean: true,
      default: false,
      describe: 'Add a wrapping node'
    },
    'only-hash': {
      alias: 'n',
      boolean: true,
      default: false,
      describe: 'Only chunk and hash, do not write'
    },
    'block-write-concurrency': {
      number: true,
      default: 10,
      describe: 'After a file has been chunked, this controls how many chunks to hash and add to the block store concurrently'
    },
    chunker: {
      default: 'size-262144',
      describe: 'Chunking algorithm to use, formatted like [size-{size}, rabin, rabin-{avg}, rabin-{min}-{avg}-{max}]'
    },
    'file-import-concurrency': {
      number: true,
      default: 50,
      describe: 'How many files to import at once'
    },
    'enable-sharding-experiment': {
      boolean: true,
      default: false
    },
    'shard-split-threshold': {
      number: true,
      default: 1000
    },
    'raw-leaves': {
      boolean: true,
      describe: 'Use raw blocks for leaf nodes. (experimental)'
    },
    'cid-version': {
      number: true,
      describe: 'CID version. Defaults to 0 unless an option that depends on CIDv1 is passed. (experimental)',
      default: 0
    },
    'cid-base': {
      describe: 'Number base to display CIDs in',
      string: true,
      default: 'base58btc'
    },
    hash: {
      string: true,
      describe: 'Hash function to use. Will set CID version to 1 if used. (experimental)',
      default: 'sha2-256'
    },
    quiet: {
      alias: 'q',
      boolean: true,
      default: false,
      describe: 'Write minimal output'
    },
    quieter: {
      alias: 'Q',
      boolean: true,
      default: false,
      describe: 'Write only final hash'
    },
    silent: {
      boolean: true,
      default: false,
      describe: 'Write no output'
    },
    pin: {
      boolean: true,
      default: true,
      describe: 'Pin this object when adding'
    },
    preload: {
      boolean: true,
      default: true,
      describe: 'Preload this object when adding'
    },
    hidden: {
      alias: 'H',
      boolean: true,
      default: false,
      describe: 'Include files that are hidden. Only takes effect on recursive add.'
    },
    'preserve-mode': {
      boolean: true,
      default: false,
      describe: 'Apply permissions to created UnixFS entries'
    },
    'preserve-mtime': {
      boolean: true,
      default: false,
      describe: 'Apply modification time to created UnixFS entries'
    },
    mode: {
      string: true,
      describe: 'File mode to apply to created UnixFS entries'
    },
    mtime: {
      number: true,
      coerce: coerceMtime,
      describe: 'Modification time in seconds before or since the Unix Epoch to apply to created UnixFS entries'
    },
    'mtime-nsecs': {
      number: true,
      coerce: coerceMtimeNsecs,
      describe: 'Modification time fraction in nanoseconds'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

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

export default command
