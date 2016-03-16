const Command = require('ronin').Command
const utils = require('../../utils')
const bs58 = require('bs58')
const bl = require('bl')
const fs = require('fs')
const mDAG = require('ipfs-merkle-dag')
const DAGNode = mDAG.DAGNode
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

function parseJSONBuffer (buf) {
  try {
    const parsed = JSON.parse(buf.toString())
    return {
      data: new Buffer(parsed.Data),
      links: parsed.Links ? parsed.Links.map((link) => ({
        name: link.Name,
        hash: new Buffer(bs58.decode(link.Hash)),
        size: link.Size
      })) : []
    }
  } catch (err) {
    log.error(err)
    throw new Error('failed to parse JSON: ' + err)
  }
}

function parseAndAddNode (buf) {
  utils.getIPFS((err, ipfs) => {
    if (err) {
      throw err
    }
    if (utils.isDaemonOn()) {
      return ipfs.object.put(buf, 'json', (err, obj) => {
        if (err) {
          log.error(err)
          throw err
        }

        console.log('added', obj.Hash)
      })
    }

    const parsed = parseJSONBuffer(buf)
    const dagNode = new DAGNode(parsed.data, parsed.links)
    ipfs.object.put(dagNode, (err, obj) => {
      if (err) {
        log.error(err)
        throw err
      }

      console.log('added', bs58.encode(dagNode.multihash()).toString())
    })
  })
}

module.exports = Command.extend({
  desc: 'Stores input as a DAG object, outputs its key',

  options: {},

  run: (filePath) => {
    if (filePath) {
      return parseAndAddNode(fs.readFileSync(filePath))
    }

    process.stdin.pipe(bl((err, input) => {
      if (err) {
        log.error(err)
        throw err
      }

      parseAndAddNode(input)
    }))
  }
})
