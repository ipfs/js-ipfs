'use strict'

const isIpfs = require('is-ipfs')
const exporter = require('ipfs-unixfs-exporter')
const pull = require('pull-stream')
const toB58String = require('multihashes').toB58String
const Boom = require('@hapi/boom')

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
exports.parseKey = (request, h) => {
  if (!request.query.arg) {
    throw Boom.badRequest("Argument 'key' is required")
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

  if (!isIpfs.ipfsPath(request.query.arg) && !isIpfs.cid(request.query.arg)) {
    throw Boom.badRequest('invalid ipfs ref path')
  }

  const subpaths = key.split('/')
  subpaths.shift()
  return {
    path: request.query.arg,
    subpaths: subpaths,
    key: key,
    hash: hash
  }
}

exports.ls = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { path, subpaths } = request.pre.args.path
    const rootDepth = subpaths.length

    const files = await new Promise((resolve, reject) => {
      pull(
        exporter(path, ipfs._ipld, { maxDepth: rootDepth + 1 }),
        pull.collect((err, files) => {
          if (err) return reject(err)
          resolve(files)
        })
      )
    })

    const res = {
      Arguments: {},
      Objects: {}
    }
    const links = []
    files.forEach((file) => {
      if (file.depth === rootDepth) {
        const id = file.cid.toString()
        res.Arguments[path] = id
        res.Objects[id] = toFileObject(file)
        res.Objects[id].Links = file.type === 'file' ? null : links
      } else {
        links.push(toFileObject(file))
      }
    })

    return h.response(res)
  }
}
