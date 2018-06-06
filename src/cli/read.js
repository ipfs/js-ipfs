'use strict'

const pull = require('pull-stream/pull')
const through = require('pull-stream/throughs/through')
const collect = require('pull-stream/sinks/collect')
const waterfall = require('async/waterfall')
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
    let {
      path,
      ipfs,
      offset,
      length
    } = argv

    argv.resolve(
      new Promise((resolve, reject) => {
        waterfall([
          (cb) => ipfs.files.readPullStream(path, {
            offset,
            length
          }, cb),
          (stream, cb) => {
            pull(
              stream,
              through(buffer => {
                print(buffer, false)
              }),
              collect(cb)
            )
          }
        ], (error) => {
          if (error) {
            return reject(error)
          }

          resolve()
        })
      })
    )
  }
}
