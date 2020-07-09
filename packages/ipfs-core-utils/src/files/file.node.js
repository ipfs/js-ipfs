// @ts-check
'use strict'

const { Blob } = require('./blob')

class File extends Blob {
  /**
   *
   * @param {BlobPart[]} init
   * @param {string} name - A USVString representing the file name or the path
   * to the file.
   * @param {Object} [options]
   * @param {string} [options.type] -  A DOMString representing the MIME type
   * of the content that will be put into the file. Defaults to a value of "".
   * @param {number} [options.lastModified] - A number representing the number
   * of milliseconds between the Unix time epoch and when the file was last
   * modified. Defaults to a value of Date.now().
   */
  constructor (init, name, options = {}) {
    super(init, options)
    /** @private */
    this._name = name.replace(/\//g, ':')
    this._lastModified = options.lastModified || Date.now()
  }

  /**
   * The name of the file referenced by the File object.
   * @type {string}
   */
  get name () {
    return this._name
  }

  /**
   * The path the URL of the File is relative to.
   * @type {string}
   */
  get webkitRelativePath () {
    return ''
  }

  /**
   * Returns the last modified time of the file, in millisecond since the UNIX
   * epoch (January 1st, 1970 at Midnight).
   * @returns {number}
   */
  get lastModified () {
    return this._lastModified
  }

  get [Symbol.toStringTag] () {
    return 'File'
  }
}

// Marking export as a DOM File object instead of custom class.
/** @type {typeof window.File} */
exports.File = File
