'use strict'

const Repo = require('ipfs-repo')

module.exports = function ({ repo }) {
  return async function * refsLocal () {
    for await (const result of repo.blocks.query({ keysOnly: true })) {
      yield dsKeyToRef(result.key)
    }
  }
}

function dsKeyToRef (key) {
  try {
    return { ref: Repo.utils.blockstore.keyToCid(key).toString() }
  } catch (err) {
    return { err: `Could not convert block with key '${key}' to CID: ${err.message}` }
  }
}
