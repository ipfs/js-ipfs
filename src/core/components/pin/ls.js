/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { parallelMap } = require('streaming-iterables')
const { resolvePath } = require('../utils')
const PinManager = require('./pin/pin-manager')
const { PinTypes } = PinManager

const PIN_LS_CONCURRENCY = 8

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

      yield * parallelMap(PIN_LS_CONCURRENCY, async cid => {
        const { key, reason, pinned } = await pinManager.isPinnedWithType(cid, type)

        if (!pinned) {
          throw new Error(`path '${paths[cids.indexOf(cid)]}' is not pinned`)
        }

        if (reason === PinTypes.direct || reason === PinTypes.recursive) {
          return { hash: key, type: reason }
        }

        return { hash: key, type: `${PinTypes.indirect} through ${reason}` }
      }, cids)

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
        .filter(({ hash }) => !indirects.includes(hash) || !pinManager.directPins.has(hash))
        .concat(indirects.map(hash => ({ type: PinTypes.indirect, hash })))
    }

    // FIXME: https://github.com/ipfs/js-ipfs/issues/2244
    yield * pins
  }
}
