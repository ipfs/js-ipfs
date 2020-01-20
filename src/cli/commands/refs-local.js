'use strict'

module.exports = {
  command: 'refs-local',

  describe: 'List all local references.',

  handler ({ getIpfs, print, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()

      for await (const ref of ipfs.refs.local()) {
        if (ref.err) {
          print(ref.err, true, true)
        } else {
          print(ref.ref)
        }
      }
    })())
  }
}
