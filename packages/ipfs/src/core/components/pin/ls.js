/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { resolvePath } = require('../../utils')
const PinManager = require('./pin-manager')
const { PinTypes } = PinManager

function toPin (type, cid, name) {
  const output = {
    type,
    cid
  }

  if (name) {
    output.name = name
  }

  return output
}

module.exports = ({ pinManager, dag }) => {
  return async function * ls (paths, options) {
    options = options || {}

    let type = PinTypes.all

    if (paths && paths.type) {
      options = paths
      paths = null
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

    if (paths) {
      paths = Array.isArray(paths) ? paths : [paths]

      // check the pinned state of specific hashes
      const cids = await resolvePath(dag, paths, { signal: options.signal })
      let noMatch = true

      for (const cid of cids) {
        const { reason, pinned, parent } = await pinManager.isPinnedWithType(cid, type)

        if (!pinned) {
          throw new Error(`path '${paths}' is not pinned`)
        }

        switch (reason) {
          case PinTypes.direct:
          case PinTypes.recursive:
            noMatch = false
            yield {
              type: reason,
              cid
            }
            break
          default:
            noMatch = false
            yield {
              type: `${PinTypes.indirect} through ${parent}`,
              cid
            }
        }
      }

      if (noMatch) {
        throw new Error('No match found')
      }

      return
    }

    if (type === PinTypes.recursive || type === PinTypes.all) {
      for await (const { cid, name } of pinManager.recursiveKeys()) {
        yield toPin(PinTypes.recursive, cid, name)
      }
    }

    if (type === PinTypes.indirect || type === PinTypes.all) {
      for await (const cid of pinManager.indirectKeys(options)) {
        yield {
          type: PinTypes.indirect,
          cid
        }
      }
    }

    if (type === PinTypes.direct || type === PinTypes.all) {
      for await (const { cid, name } of pinManager.directKeys()) {
        yield toPin(PinTypes.direct, cid, name)
      }
    }
  }
}
