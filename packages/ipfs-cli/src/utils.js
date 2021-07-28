'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const log = require('debug')('ipfs:cli:utils')
const Progress = require('progress')
// @ts-ignore no types
const byteman = require('byteman')
const IPFS = require('ipfs-core')
const { CID } = require('multiformats/cid')
const { Multiaddr } = require('multiaddr')
const { fromString: uint8ArrayFromString } = require('@vascosantos/uint8arrays/from-string')

const getRepoPath = () => {
  return process.env.IPFS_PATH || path.join(os.homedir(), '/.jsipfs')
}

const isDaemonOn = () => {
  try {
    fs.readFileSync(path.join(getRepoPath(), 'api'))
    log('daemon is on')
    return true
  } catch (err) {
    log('daemon is off')
    return false
  }
}

let visible = true
const disablePrinting = () => { visible = false }

/**
 * @type {import('./types').Print}
 */
const print = (msg, includeNewline = true, isError = false) => {
  if (visible) {
    if (msg === undefined) {
      msg = ''
    }
    msg = msg.toString()
    msg = includeNewline ? msg + '\n' : msg
    const outStream = isError ? process.stderr : process.stdout

    outStream.write(msg)
  }
}

print.clearLine = () => {
  return process.stdout.clearLine(0)
}

/**
 * @param {number} pos
 */
print.cursorTo = (pos) => {
  process.stdout.cursorTo(pos)
}

/**
 * Write data directly to stdout
 *
 * @param {string|Uint8Array} data
 */
print.write = (data) => {
  process.stdout.write(data)
}

/**
 * Print an error message
 *
 * @param {string} msg
 * @param {boolean} [newline=true]
 */
print.error = (msg, newline = true) => {
  print(msg, newline, true)
}

// used by ipfs.add to interrupt the progress bar
print.isTTY = process.stdout.isTTY
print.columns = process.stdout.columns

/**
 * @param {number} totalBytes
 * @param {*} output
 */
const createProgressBar = (totalBytes, output) => {
  const total = byteman(totalBytes, 2, 'MB')
  const barFormat = `:progress / ${total} [:bar] :percent :etas`

  // 16 MB / 34 MB [===========             ] 48% 5.8s //
  return new Progress(barFormat, {
    incomplete: ' ',
    clear: true,
    stream: output,
    total: totalBytes
  })
}

/**
 * @param {*} val
 * @param {number} n
 */
const rightpad = (val, n) => {
  let result = String(val)
  for (let i = result.length; i < n; ++i) {
    result += ' '
  }
  return result
}

const ipfsPathHelp = 'ipfs uses a repository in the local file system. By default, the repo is ' +
  'located at ~/.jsipfs. To change the repo location, set the $IPFS_PATH environment variable:\n\n' +
  'export IPFS_PATH=/path/to/ipfsrepo\n'

/**
 * @param {{ api?: string, silent?: boolean, migrate?: boolean, pass?: string }} argv
 */
async function getIpfs (argv) {
  if (!argv.api && !isDaemonOn()) {
    const ipfs = await IPFS.create({
      silent: argv.silent,
      repoAutoMigrate: argv.migrate,
      repo: getRepoPath(),
      init: { allowNew: false },
      start: false,
      pass: argv.pass
    })

    return {
      isDaemon: false,
      ipfs,
      cleanup: async () => {
        await ipfs.stop()
      }
    }
  }

  let endpoint = null
  if (!argv.api) {
    const apiPath = path.join(getRepoPath(), 'api')
    endpoint = fs.readFileSync(apiPath).toString()
  } else {
    endpoint = argv.api
  }
  // Required inline to reduce startup time
  const { create } = require('ipfs-http-client')
  return {
    isDaemon: true,
    ipfs: create({ url: endpoint }),
    cleanup: async () => { }
  }
}

/**
 * @param {boolean} [value]
 */
const asBoolean = (value) => {
  if (value === false || value === true) {
    return value
  }

  if (value === undefined) {
    return true
  }

  return false
}

/**
 * @param {any} value
 */
const asOctal = (value) => {
  return parseInt(value, 8)
}

/**
 * @param {number} [secs]
 * @param {number} [nsecs]
 */
const asMtimeFromSeconds = (secs, nsecs) => {
  if (secs == null) {
    return undefined
  }

  return {
    secs,
    nsecs
  }
}

/**
 * @param {*} value
 */
const coerceMtime = (value) => {
  value = parseInt(value)

  if (isNaN(value)) {
    throw new Error('mtime must be a number')
  }

  return value
}

/**
 * @param {*} value
 */
const coerceMtimeNsecs = (value) => {
  value = parseInt(value)

  if (isNaN(value)) {
    throw new Error('mtime-nsecs must be a number')
  }

  if (value < 0 || value > 999999999) {
    throw new Error('mtime-nsecs must be in the range [0,999999999]')
  }

  return value
}

/**
 * @param {*} value
 */
const coerceCID = (value) => {
  if (!value) {
    return undefined
  }

  if (value.startsWith('/ipfs/')) {
    return CID.parse(value.split('/')[2])
  }

  return CID.parse(value)
}

/**
 * @param {string[]} values
 */
const coerceCIDs = (values) => {
  if (values == null) {
    return []
  }

  return values.map(coerceCID).filter(Boolean)
}

/**
 * @param {string} value
 */
const coerceMultiaddr = (value) => {
  if (value == null) {
    return undefined
  }

  return new Multiaddr(value)
}

/**
 * @param {string[]} values
 */
const coerceMultiaddrs = (values) => {
  if (values == null) {
    return undefined
  }

  return values.map(coerceMultiaddr).filter(Boolean)
}

/**
 * @param {string} value
 */
const coerceUint8Array = (value) => {
  if (value == null) {
    return undefined
  }

  return uint8ArrayFromString(value)
}

const DEL = 127

/**
 * Strip control characters from a string
 *
 * @param {string} [str] - a string to strip control characters from
 */
const stripControlCharacters = (str) => {
  return (str || '')
    .split('')
    .filter((c) => {
      const charCode = c.charCodeAt(0)

      return charCode > 31 && charCode !== DEL
    })
    .join('')
}

/**
 * Escape control characters in a string
 *
 * @param {string} str - a string to escape control characters in
 */
const escapeControlCharacters = (str) => {
  /** @type {Record<string, string>} */
  const escapes = {
    '00': '\\0',
    '08': '\\b',
    '09': '\\t',
    '0A': '\\n',
    '0B': '\\v',
    '0C': '\\f',
    '0D': '\\r'
  }

  return (str || '')
    .split('')
    .map((c) => {
      const charCode = c.charCodeAt(0)

      if (charCode > 31 && charCode !== DEL) {
        return c
      }

      const hex = Number(c).toString(16).padStart(2, '0')

      return escapes[hex] || `\\x${hex}`
    })
    .join('')
}

/**
 * Removes control characters from all key/values and stringifies
 * CID properties
 *
 * @param {any} obj - all keys/values in this object will be have control characters stripped
 * @param {import('multiformats/bases/interface').MultibaseCodec<any>} cidBase - any encountered CIDs will be stringified using this base
 * @returns {any}
 */
const makeEntriesPrintable = (obj, cidBase) => {
  if (obj instanceof CID) {
    return { '/': obj.toString(cidBase.encoder) }
  }

  if (typeof obj === 'string') {
    return stripControlCharacters(obj)
  }

  if (typeof obj === 'number' || obj == null || obj === true || obj === false) {
    return obj
  }

  if (Array.isArray(obj)) {
    const output = []

    for (const key of obj) {
      output.push(makeEntriesPrintable(key, cidBase))
    }

    return output
  }

  /** @type {Record<string, any>} */
  const output = {}

  Object.entries(obj)
    .forEach(([key, value]) => {
      const outputKey = stripControlCharacters(key)

      output[outputKey] = makeEntriesPrintable(value, cidBase)
    })

  return output
}

module.exports = {
  getIpfs,
  isDaemonOn,
  getRepoPath,
  disablePrinting,
  print,
  createProgressBar,
  rightpad,
  ipfsPathHelp,
  asBoolean,
  asOctal,
  asMtimeFromSeconds,
  coerceMtime,
  coerceMtimeNsecs,
  coerceCID,
  coerceCIDs,
  coerceMultiaddr,
  coerceMultiaddrs,
  coerceUint8Array,
  stripControlCharacters,
  escapeControlCharacters,
  makeEntriesPrintable
}
