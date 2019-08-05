'use strict'

const pull = require('pull-stream/pull')
const through = require('pull-stream/throughs/through')
const onEnd = require('pull-stream/sinks/on-end')
const {
  print
} = require('./utils')

module.exports = {
  command: 'read <path>',

  describe: 'Read an mfs file',

  builder: {
    offset: {
      alias: 'o',
      type: 'number',
      describe: 'Start writing at this offset'
    },
    length: {
      alias: 'l',
      type: 'number',
      describe: 'Write only this number of bytes'
    }
  },

  handler (argv) {
    const {
      path,
      getIpfs,
      offset,
      length
    } = argv

    argv.resolve((async () => {
      const ipfs = await getIpfs()

      return new Promise((resolve, reject) => {
        pull(
          ipfs.files.readPullStream(path, {
            offset,
            length
          }),
          through(buffer => {
            print(buffer, false)
          }),
          onEnd((error) => {
            if (error) {
              return reject(error)
            }

            resolve()
          })
        )
      })
    })())
  }
}
