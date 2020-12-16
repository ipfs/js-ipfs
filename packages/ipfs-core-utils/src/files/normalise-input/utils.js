'use strict'

const { Blob } = require('ipfs-utils/src/globalthis')

/**
 * @param {any} obj
 * @returns {obj is ArrayBufferView|ArrayBuffer}
 */
function isBytes (obj) {
  return ArrayBuffer.isView(obj) || obj instanceof ArrayBuffer
}

/**
 * @param {any} obj
 * @returns {obj is Blob}
 */
function isBlob (obj) {
  return typeof Blob !== 'undefined' && obj instanceof Blob
}

/**
 * An object with a path or content property
 *
 * @param {any} obj
 * @returns {obj is import('ipfs-core-types/src/files').ToEntry}
 */
function isFileObject (obj) {
  return typeof obj === 'object' && (obj.path || obj.content)
}

/**
 * @param {any} value
 * @returns {value is ReadableStream}
 */
const isReadableStream = (value) =>
  value && typeof value.getReader === 'function'

/**
 * @param {any} mtime
 * @returns {{secs:number, nsecs:number}|undefined}
 */
function mtimeToObject (mtime) {
  if (mtime == null) {
    return undefined
  }

  // Javascript Date
  if (mtime instanceof Date) {
    const ms = mtime.getTime()
    const secs = Math.floor(ms / 1000)

    return {
      secs: secs,
      nsecs: (ms - (secs * 1000)) * 1000
    }
  }

  // { secs, nsecs }
  if (Object.prototype.hasOwnProperty.call(mtime, 'secs')) {
    return {
      secs: mtime.secs,
      nsecs: mtime.nsecs
    }
  }

  // UnixFS TimeSpec
  if (Object.prototype.hasOwnProperty.call(mtime, 'Seconds')) {
    return {
      secs: mtime.Seconds,
      nsecs: mtime.FractionalNanoseconds
    }
  }

  // process.hrtime()
  if (Array.isArray(mtime)) {
    return {
      secs: mtime[0],
      nsecs: mtime[1]
    }
  }
  /*
  TODO: https://github.com/ipfs/aegir/issues/487

  // process.hrtime.bigint()
  if (typeof mtime === 'bigint') {
    const secs = mtime / BigInt(1e9)
    const nsecs = mtime - (secs * BigInt(1e9))

    return {
      secs: parseInt(secs),
      nsecs: parseInt(nsecs)
    }
  }
  */
}

/**
 * @param {any} mode
 * @returns {number|undefined}
 */
function modeToNumber (mode) {
  if (mode == null) {
    return undefined
  }

  if (typeof mode === 'number') {
    return mode
  }

  mode = mode.toString()

  if (mode.substring(0, 1) === '0') {
    // octal string
    return parseInt(mode, 8)
  }

  // decimal string
  return parseInt(mode, 10)
}

module.exports = {
  isBytes,
  isBlob,
  isFileObject,
  isReadableStream,
  mtimeToObject,
  modeToNumber
}
