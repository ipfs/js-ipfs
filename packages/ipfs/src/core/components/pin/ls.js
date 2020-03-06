/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const PinManager = require('./pin-manager')
const { PinTypes } = PinManager
const normaliseInput = require('ipfs-utils/src/pins/normalise-input')
const { resolvePath } = require('../../utils')

function toPin (type, cid, comments) {
  const output = {
    type,
    cid
  }

  if (comments) {
    output.comments = comments
  }

  return output
}

module.exports = ({ pinManager, dag }) => {
  return async function * ls (source, options) {
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
      let noMatch = true

      for await (const { path } of normaliseInput(source)) {
        const cid = await resolvePath(dag, path)
        const { reason, pinned, parent, comments } = await pinManager.isPinnedWithType(cid, type)

        if (!pinned) {
          throw new Error(`path '${path}' is not pinned`)
        }

        switch (reason) {
          case PinTypes.direct:
          case PinTypes.recursive:
            noMatch = false
            yield toPin(reason, cid, comments)
            break
          default:
            noMatch = false
            yield toPin(`${PinTypes.indirect} through ${parent}`, cid, comments)
        }
      }

      if (noMatch) {
        throw new Error('No match found')
      }

      return
    }

    if (type === PinTypes.recursive || type === PinTypes.all) {
      for await (const { cid, comments } of pinManager.recursiveKeys()) {
        yield toPin(PinTypes.recursive, cid, comments)
      }
    }

    if (type === PinTypes.indirect || type === PinTypes.all) {
      for await (const cid of pinManager.indirectKeys(options)) {
        yield toPin(PinTypes.indirect, cid)
      }
    }

    if (type === PinTypes.direct || type === PinTypes.all) {
      for await (const { cid, comments } of pinManager.directKeys()) {
        yield toPin(PinTypes.direct, cid, comments)
      }
    }
  }
}
