'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')

module.exports = {
  command: 'new [<template>]',

  describe: 'Create new ipfs objects',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: multibase.names
    }
  },

  async handler ({ ctx, template, cidBase }) {
    const { ipfs, print } = ctx
    const cid = await ipfs.object.new(template)
    print(cidToString(cid, { base: cidBase, upgrade: false }))
  }
}
