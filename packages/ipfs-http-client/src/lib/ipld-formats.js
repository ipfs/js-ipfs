'use strict'

const dagPB = require('ipld-dag-pb')
const dagCBOR = require('ipld-dag-cbor')
const raw = require('ipld-raw')
const multicodec = require('multicodec')

/**
 * @typedef {import('cids')} CID
 */

/**
 * Return an object containing supported IPLD Formats
 *
 * @param {object} [options] - Options passed to the http client constructor
 * @param {object} [options.ipld] - IPLD options passed to the http client constructor
 * @param {Array} [options.ipld.formats] - A list of IPLD Formats to use
 * @param {Function} [options.ipld.loadFormat] - An async function that can load a format when passed a codec name
 * @returns {Function}
 */
module.exports = (options) => {
  const formats = {
    [multicodec.DAG_PB]: dagPB,
    [multicodec.DAG_CBOR]: dagCBOR,
    [multicodec.RAW]: raw
  }

  const ipldOptions = (options && options.ipld) || {}
  const configuredFormats = (ipldOptions && ipldOptions.formats) || []
  configuredFormats.forEach(format => {
    formats[format.codec] = format
  })

  const loadExtraFormat = options && options.ipld && options.ipld.loadFormat

  /**
   * Attempts to load an IPLD format for the passed CID
   *
   * @param {string} codec - The code to load the format for
   * @returns {Promise<object>} - An IPLD format
   */
  const loadFormat = async (codec) => {
    const number = multicodec.getNumber(codec)
    let format = formats[number]

    if (!format && loadExtraFormat) {
      format = await loadExtraFormat(codec)
    }

    if (!format) {
      throw Object.assign(
        new Error(`Missing IPLD format "${codec}"`),
        { missingMulticodec: codec }
      )
    }

    return format
  }

  return loadFormat
}
