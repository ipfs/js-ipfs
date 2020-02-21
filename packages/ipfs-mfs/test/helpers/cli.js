'use strict'

const yargs = require('yargs')
const YargsPromise = require('yargs-promise')
const mfs = require('../../src/cli')

module.exports = (command, { ipfs, print = () => {}, getStdin }) => {
  const parser = new YargsPromise(mfs(yargs), {
    getIpfs: () => ipfs,
    print,
    getStdin
  })

  return parser
    .parse(command)
}
