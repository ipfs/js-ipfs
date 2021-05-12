'use strict'

const multibase = require('multibase')
const { cidToString } = require('ipfs-core-utils/src/cid')
const { default: parseDuration } = require('parse-duration')

module.exports = {
  command: 'new [<template>]',

  describe: 'Create new ipfs objects',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: Object.keys(multibase.names)
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {'unixfs-dir'} argv.template
   * @param {import('multibase').BaseName} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, template, cidBase, timeout }) {
    const cid = await ipfs.object.new({
      template,
      timeout
    })
    print(cidToString(cid, { base: cidBase, upgrade: false }))
  }
}
