/* eslint-disable complexity */
'use strict'

const { promisify } = require('util')
const getFolderSize = promisify(require('get-folder-size'))
const byteman = require('byteman')
const mh = require('multihashing-async').multihash
const multibase = require('multibase')
const {
  createProgressBar,
  coerceMtime,
  coerceMtimeNsecs
} = require('../utils')
const { cidToString } = require('../../utils/cid')
const globSource = require('ipfs-utils/src/files/glob-source')
const parseDuration = require('parse-duration').default

async function getTotalBytes (paths) {
  const sizes = await Promise.all(paths.map(p => getFolderSize(p)))
  return sizes.reduce((total, size) => total + size, 0)
}

module.exports = {
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
      describe: 'Use raw blocks for leaf nodes. (experimental)',
      default: false
    },
    'cid-version': {
      type: 'integer',
      describe: 'CID version. Defaults to 0 unless an option that depends on CIDv1 is passed. (experimental)',
      default: 0
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: Object.keys(multibase.names)
    },
    hash: {
      type: 'string',
      choices: Object.keys(mh.names),
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
    cidBase
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
      progress: () => {},
      timeout
    }

    if (options.enableShardingExperiment && isDaemon) {
      throw new Error('Error: Enabling the sharding experiment should be done on the daemon')
    }

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
      options.progress = byteLength => {
        bar.update(byteLength / totalBytes, { progress: byteman(byteLength, 2, 'MB') })
      }
    }

    if (mtime != null) {
      mtime = {
        secs: mtime
      }

      if (mtimeNsecs != null) {
        mtime.nsecs = mtimeNsecs
      }
    }

    const source = file
      ? globSource(file, {
        recursive,
        hidden,
        preserveMode,
        preserveMtime,
        mode,
        mtime
      })
      : {
        content: getStdin(),
        mode,
        mtime
      } // Pipe to ipfs.add tagging with mode and mtime

    let finalCid

    try {
      for await (const added of ipfs.addAll(source, options)) {
        if (silent) {
          continue
        }

        if (quieter) {
          finalCid = added.cid
          continue
        }

        const cid = cidToString(added.cid, { base: cidBase })
        let message = cid

        if (!quiet) {
          // print the hash twice if we are piping from stdin
          message = `added ${cid} ${file ? added.path || '' : cid}`.trim()
        }

        log(message)
      }
    } catch (err) {
      // Tweak the error message and add more relevant infor for the CLI
      if (err.code === 'ERR_DIR_NON_RECURSIVE') {
        err.message = `'${err.path}' is a directory, use the '-r' flag to specify directories`
      }

      throw err
    } finally {
      if (bar) {
        bar.terminate()
      }
    }

    if (quieter) {
      log(cidToString(finalCid, { base: cidBase }))
    }
  }
}
