'use strict'

const { print } = require('../utils')

module.exports = {
  command: 'refs-local',

  describe: 'List all local references.',

  handler ({ getIpfs, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const refs = await ipfs.refs.local()
      for (const ref of refs) {
        print(ref.Ref)
      }
    })())
  }
}
