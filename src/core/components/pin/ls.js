/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { resolvePath } = require('../utils')
const PinManager = require('./pin/pin-manager')
const PinTypes = PinManager.PinTypes

module.exports = ({ pinManager, object }) => {
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
      const err = PinManager.checkPinType(type)
      if (err) {
        throw err
      }
    }

    if (paths) {
      // check the pinned state of specific hashes
      const cids = await resolvePath(object, paths)

      for (let i = 0; i < cids.length; i++) {
        const cid = cids[i]
        const { key, reason, pinned } = await pinManager.isPinnedWithType(cid, type)

        if (pinned) {
          switch (reason) {
            case PinTypes.direct:
            case PinTypes.recursive:
              yield {
                hash: key,
                type: reason
              }
              break
            default:
              yield {
                hash: key,
                type: `${PinTypes.indirect} through ${reason}`
              }
          }
        } else {
          throw new Error(`path '${paths[i]}' is not pinned`)
        }
      }

      return
    }

    // show all pinned items of type
    let pins = []

    if (type === PinTypes.direct || type === PinTypes.all) {
      pins = pins.concat(
        Array.from(pinManager.directPins).map(hash => ({
          type: PinTypes.direct,
          hash
        }))
      )
    }

    if (type === PinTypes.recursive || type === PinTypes.all) {
      pins = pins.concat(
        Array.from(pinManager.recursivePins).map(hash => ({
          type: PinTypes.recursive,
          hash
        }))
      )
    }

    if (type === PinTypes.indirect || type === PinTypes.all) {
      const indirects = await pinManager.getIndirectKeys(options)

      pins = pins
        // if something is pinned both directly and indirectly,
        // report the indirect entry
        .filter(({ hash }) =>
          !indirects.includes(hash) ||
          (indirects.includes(hash) && !pinManager.directPins.has(hash))
        )
        .concat(indirects.map(hash => ({
          type: PinTypes.indirect,
          hash
        })))
    }

    // FIXME: https://github.com/ipfs/js-ipfs/issues/2244
    yield * pins
  }
}
