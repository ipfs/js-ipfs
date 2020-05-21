'use strict'

const Repo = require('ipfs-repo')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import("interface-datastore").Key} Key
 * @typedef {Object} LocalRefsConfig
 * @property {Repo} [repo]
 *
 * @typedef {Object} Ref
 * @property {string} ref
 * @property {void} [err]
 *
 * @typedef {Object} Err
 * @property {string} err
 * @property {void} [ref]
 */

/**
 * @param {LocalRefsConfig} config
 * @returns {function():AsyncIterable<Ref|Err>}
 */
module.exports = function ({ repo }) {
  return withTimeoutOption(async function * refsLocal (options = {}) {
    for await (const result of repo.blocks.query({ keysOnly: true, signal: options.signal })) {
      yield dsKeyToRef(result.key)
    }
  })
}

/**
 *
 * @param {Key} key
 * @returns {Ref|Err}
 */
function dsKeyToRef (key) {
  try {
    return { ref: Repo.utils.blockstore.keyToCid(key).toString() }
  } catch (err) {
    return { err: `Could not convert block with key '${key}' to CID: ${err.message}` }
  }
}
