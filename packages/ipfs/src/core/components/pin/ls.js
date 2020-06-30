/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const PinManager = require('./pin-manager')
const { PinTypes } = PinManager
const normaliseInput = require('ipfs-core-utils/src/pins/normalise-input')
const { resolvePath, withTimeoutOption } = require('../../utils')

function toPin (type, cid, metadata) {
  const output = {
    type,
    cid
  }

  if (metadata) {
    output.metadata = metadata
  }

  return output
}

module.exports = ({ pinManager, dag }) => {
  return withTimeoutOption(async function * ls (source, options) {
    options = options || {}

    let type = PinTypes.all

    if (source && source.type) {
      options = source
      source = null
    }

    if (options.type) {
      type = options.type
      if (typeof options.type === 'string') {
        type = options.type.toLowerCase()
      }

      PinManager.checkPinType(type)
    } else {
      options.type = PinTypes.all
    }

    if (source) {
      // check the pinned state of specific hashes
      let matched = false

      for await (const { path } of normaliseInput(source)) {
        const cid = await resolvePath(dag, path)
        const { reason, pinned, parent, metadata } = await pinManager.isPinnedWithType(cid, type)

        if (!pinned) {
          throw new Error(`path '${path}' is not pinned`)
        }

        switch (reason) {
          case PinTypes.direct:
          case PinTypes.recursive:
            matched = true
            yield toPin(reason, cid, metadata)
            break
          default:
            matched = true
            yield toPin(`${PinTypes.indirect} through ${parent}`, cid, metadata)
        }
      }

      if (!matched) {
        throw new Error('No match found')
      }

      return
    }

    if (type === PinTypes.recursive || type === PinTypes.all) {
      for await (const { cid, metadata } of pinManager.recursiveKeys()) {
        yield toPin(PinTypes.recursive, cid, metadata)
      }
    }

    if (type === PinTypes.indirect || type === PinTypes.all) {
      for await (const cid of pinManager.indirectKeys(options)) {
        yield toPin(PinTypes.indirect, cid)
      }
    }

    if (type === PinTypes.direct || type === PinTypes.all) {
      for await (const { cid, metadata } of pinManager.directKeys()) {
        yield toPin(PinTypes.direct, cid, metadata)
      }
    }
  })
}
