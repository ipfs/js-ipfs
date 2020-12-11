'use strict'

const dagPB = require('ipld-dag-pb')
const dagCBOR = require('ipld-dag-cbor')
const raw = require('ipld-raw')
const multicodec = require('multicodec')

const noop = () => {}

/**
 * @typedef {import('cids')} CID
 */

/**
 * Return an object containing supported IPLD Formats
 *
 * @param {object} [options] - IPLD options passed to the http client constructor
 * @param {Array} [options.formats] - A list of IPLD Formats to use
 * @param {Function} [options.loadFormat] - An async function that can load a format when passed a codec number
 * @returns {Function}
 */
module.exports = ({ formats = [], loadFormat = noop } = {}) => {
  formats = formats || []
  loadFormat = loadFormat || noop

  const configuredFormats = {
    [multicodec.DAG_PB]: dagPB,
    [multicodec.DAG_CBOR]: dagCBOR,
    [multicodec.RAW]: raw
  }

  formats.forEach(format => {
    configuredFormats[format.codec] = format
  })

  /**
   * Attempts to load an IPLD format for the passed CID
   *
   * @param {import('multicodec').CodecName} codec - The code to load the format for
   * @returns {Promise<object>} - An IPLD format
   */
  const loadResolver = async (codec) => {
    // @ts-ignore - codec is a string and not a CodecName
    const number = multicodec.getNumber(codec)
    const format = configuredFormats[number] || await loadFormat(codec)

    if (!format) {
      throw Object.assign(
        new Error(`Missing IPLD format "${codec}"`),
        { missingMulticodec: codec }
      )
    }

    return format
  }

  return loadResolver
}
