'use strict'

const Repo = require('ipfs-repo')
const { withTimeoutOption } = require('../../utils')

module.exports = function ({ repo }) {
  return withTimeoutOption(async function * refsLocal (options = {}) {
    for await (const result of repo.blocks.query({ keysOnly: true, signal: options.signal })) {
      yield dsKeyToRef(result.key)
    }
  })
}

function dsKeyToRef (key) {
  try {
    return { ref: Repo.utils.blockstore.keyToCid(key).toString() }
  } catch (err) {
    return { err: `Could not convert block with key '${key}' to CID: ${err.message}` }
  }
}
