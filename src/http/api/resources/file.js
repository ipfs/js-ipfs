'use strict'

const mh = require('multihashes')
const debug = require('debug')
const log = debug('jsipfs:http-api:file')
log.error = debug('jsipfs:http-api:file:error')
const unixfsEngine = require('ipfs-unixfs-engine')
const exporter = unixfsEngine.exporter
const pull = require('pull-stream')
const toB58String = require('multihashes').toB58String

exports = module.exports

const fileTypeMap = {
  file: 'File',
  dir: 'Directory'
}

function toFileObject (file) {
  const fo = {
    Hash: toB58String(file.hash),
    Size: file.size,
    Type: fileTypeMap[file.type] || file.type
  }
  if (fo.Hash !== file.name) {
    fo.Name = file.name
  }
  return fo
}

// common pre request handler that parses the args and returns `key` which is assigned to `request.pre.args`
exports.parseKey = (request, reply) => {
  if (!request.query.arg) {
    return reply({
      Message: "Argument 'key' is required",
      Code: 0
    }).code(400).takeover()
  }

  let key = request.query.arg
  if (key.indexOf('/ipfs/') === 0) {
    key = key.substring(6)
  }

  let hash = key
  const slashIndex = hash.indexOf('/')
  if (slashIndex > 0) {
    hash = hash.substring(0, slashIndex)
  }

  try {
    mh.fromB58String(hash)
  } catch (err) {
    log.error(err)
    return reply({
      Message: 'invalid ipfs ref path',
      Code: 0
    }).code(500).takeover()
  }

  const subpaths = key.split('/')
  subpaths.shift()
  reply({
    path: request.query.arg,
    subpaths: subpaths,
    key: key,
    hash: hash
  })
}

exports.ls = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const path = request.pre.args.path
    const ipfs = request.server.app.ipfs
    const subpaths = request.pre.args.subpaths
    const rootDepth = subpaths.length

    pull(
      exporter(path, ipfs._ipldResolver, { maxDepth: rootDepth + 1 }),
      pull.collect((err, files) => {
        if (err) {
          return reply({
            Message: 'Failed to list dir: ' + err.message,
            Code: 0
          }).code(500)
        }

        let res = {
          Arguments: {},
          Objects: {}
        }
        const links = []
        files.forEach((file) => {
          if (file.depth === rootDepth) {
            let id = toB58String(file.hash)
            res.Arguments[path] = id
            res.Objects[id] = toFileObject(file)
            res.Objects[id].Links = file.type === 'file' ? null : links
          } else {
            links.push(toFileObject(file))
          }
        })
        return reply(res)
      })
    )
  }
}
