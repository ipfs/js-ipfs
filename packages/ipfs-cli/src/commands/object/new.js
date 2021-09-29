import parseDuration from 'parse-duration'

export default {
  command: 'new [<template>]',

  describe: 'Create new ipfs objects',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      default: 'base58btc'
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
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, template, cidBase, timeout }) {
    const cid = await ipfs.object.new({
      template,
      timeout
    })
    const base = await ipfs.bases.getBase(cidBase)
    print(cid.toString(base.encoder))
  }
}
