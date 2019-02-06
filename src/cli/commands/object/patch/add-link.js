'use strict'

const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
const multibase = require('multibase')
const promisify = require('promisify-es6')
const { print } = require('../../../utils')
const { cidToString } = require('../../../../utils/cid')

module.exports = {
  command: 'add-link <root> <name> <ref>',

  describe: 'Add a link to a given object',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: multibase.names
    }
  },

  handler ({ getIpfs, root, name, ref, cidBase, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const nodeA = await ipfs.object.get(ref, { enc: 'base58' })
      const result = await promisify(dagPB.util.cid)(nodeA)
      const link = new DAGLink(name, nodeA.size, result)
      const cid = await ipfs.object.patch.addLink(root, link, { enc: 'base58' })
      print(cidToString(cid, { base: cidBase, upgrade: false }))
    })())
  }
}
