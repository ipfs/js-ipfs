'use strict'

const mh = require('multihashes')
const multipart = require('ipfs-multipart')
const debug = require('debug')
const tar = require('tar-stream')
const log = debug('jsipfs:http-api:files')
log.error = debug('jsipfs:http-api:files:error')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const pushable = require('pull-pushable')
const toStream = require('pull-stream-to-stream')
const abortable = require('pull-abortable')
const Joi = require('joi')
const ndjson = require('pull-ndjson')

exports = module.exports

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

  reply({
    path: request.query.arg,
    key: key,
    hash: hash
  })
}

exports.ls = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key
    const path = request.pre.args.path
    const hash = request.pre.args.hash
    const ipfs = request.server.app.ipfs

    ipfs.ls(key, (err, files) => {
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
      res.Arguments[path] = key
      res.Objects[key] = {
        Hash: hash,
        Size: 0,
        Type: 'Directory',
        Links: files.map((file) => ({
          Name: file.name,
          Hash: file.hash,
          Size: file.size,
          Type: file.type
        }))
      }
      reply(res)
      
    })
  }
}
