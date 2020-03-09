'use strict'

const yargs = require('yargs')
const mfs = require('../../src/cli')

module.exports = (command, { ipfs, print, getStdin }) => {
  const parser = mfs(yargs)

  return new Promise((resolve, reject) => {
    parser
      .onFinishCommand((data) => {
        resolve(data)
      })
      .fail((msg, err) => {
        if (msg) {
          reject(new Error(msg))
        } else {
          reject(err)
        }
      })
      .parse(command, {
        ctx: {
          ipfs,
          print,
          getStdin
        }
      })
  })
}
