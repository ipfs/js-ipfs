'use strict'

const mergeOptions = require('merge-options')
const multicodec = require('multicodec')

// All known (non-default) IPLD formats
const IpldFormats = {
  get [multicodec.DAG_PB] () {
    return require('ipld-dag-pb')
  },
  get [multicodec.DAG_CBOR] () {
    return require('ipld-dag-cbor')
  },
  get [multicodec.RAW] () {
    return require('ipld-raw')
  }
}

module.exports = (blockService, options = {}, log) => {
  return mergeOptions.call(
    // ensure we have the defaults formats even if the user overrides `formats: []`
    { concatArrays: true },
    {
      blockService: blockService,
      loadFormat: (codec) => {
        log('Loading IPLD format', codec)
        if (IpldFormats[codec]) {
          return IpldFormats[codec]
        } else {
          throw new Error(`Missing IPLD format "${multicodec.getName(codec)}"`)
        }
      }
    }, options)
}
