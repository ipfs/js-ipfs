'use strict'

const promisify = require('promisify-es6')
const getFolderSize = promisify(require('get-folder-size'))
const byteman = require('byteman')
const mh = require('multihashes')
const multibase = require('multibase')
const { createProgressBar } = require('../utils')
const { cidToString } = require('../../utils/cid')
const globSource = require('ipfs-utils/src/files/glob-source')

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
    chunker: {
      default: 'size-262144',
      describe: 'Chunking algorithm to use, formatted like [size-{size}, rabin, rabin-{avg}, rabin-{min}-{avg}-{max}]'
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
      choices: multibase.names
    },
    hash: {
      type: 'string',
      choices: Object.keys(mh.names),
      describe: 'Hash function to use. Will set CID version to 1 if used. (experimental)'
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
    }
  },

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      const options = {
        trickle: argv.trickle,
        shardSplitThreshold: argv.enableShardingExperiment
          ? argv.shardSplitThreshold
          : Infinity,
        cidVersion: argv.cidVersion,
        rawLeaves: argv.rawLeaves,
        onlyHash: argv.onlyHash,
        hashAlg: argv.hash,
        wrapWithDirectory: argv.wrapWithDirectory,
        pin: argv.pin,
        chunker: argv.chunker,
        preload: argv.preload
      }

      if (options.enableShardingExperiment && argv.isDaemonOn()) {
        throw new Error('Error: Enabling the sharding experiment should be done on the daemon')
      }

      let bar
      let log = argv.print

      if (argv.quieter || argv.quiet || argv.silent) {
        argv.progress = false
      }

      if (argv.progress && argv.file) {
        const totalBytes = await getTotalBytes(argv.file)
        bar = createProgressBar(totalBytes)

        if (process.stdout.isTTY) {
          // bar.interrupt uses clearLine and cursorTo methods that are only on TTYs
          log = bar.interrupt.bind(bar)
        }

        options.progress = byteLength => {
          bar.update(byteLength / totalBytes, { progress: byteman(byteLength, 2, 'MB') })
        }
      }

      const source = argv.file
        ? globSource(argv.file, { recursive: argv.recursive })
        : process.stdin // Pipe directly to ipfs.add

      let finalHash

      try {
        for await (const file of ipfs._addAsyncIterator(source, options)) {
          if (argv.silent) {
            continue
          }

          if (argv.quieter) {
            finalHash = file.hash
            continue
          }

          const cid = cidToString(file.hash, { base: argv.cidBase })
          let message = cid

          if (!argv.quiet) {
            // print the hash twice if we are piping from stdin
            message = `added ${cid} ${argv.file ? file.path || '' : cid}`.trim()
          }

          log(message)
        }
      } catch (err) {
        if (bar) {
          bar.terminate()
        }

        // Tweak the error message and add more relevant infor for the CLI
        if (err.code === 'ERR_DIR_NON_RECURSIVE') {
          err.message = `'${err.path}' is a directory, use the '-r' flag to specify directories`
        }

        throw err
      }

      if (bar) {
        bar.terminate()
      }

      if (argv.quieter) {
        log(cidToString(finalHash, { base: argv.cidBase }))
      }
    })())
  }
}
