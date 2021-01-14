'use strict'

/**
 * Transforms an array of ArrayBuffers into a Set,
 * and makes sure the buffers are not detached.
 *
 * @param {Transferable[]} values
 * @returns {Set<Transferable>}
 */
const ensureUniqueBuffers = values => new Set(values)
exports.ensureUniqueBuffers = ensureUniqueBuffers
