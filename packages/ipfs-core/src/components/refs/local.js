'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = function ({ repo }) {
  return withTimeoutOption(async function * refsLocal (options = {}) {
    for await (const cid of repo.blocks.query({ keysOnly: true, signal: options.signal })) {
      yield { ref: cid.toString() }
    }
  })
}
