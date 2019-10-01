'use strict'

const CID = require('cids')
const multipart = require('ipfs-multipart')
const all = require('async-iterator-all')
const dagPB = require('ipld-dag-pb')
const { DAGNode, DAGLink } = dagPB
const Joi = require('@hapi/joi')
const multibase = require('multibase')
const Boom = require('@hapi/boom')
const { cidToString } = require('../../../utils/cid')
const debug = require('debug')
const log = debug('ipfs:http-api:object')
log.error = debug('ipfs:http-api:object:error')

// common pre request handler that parses the args and returns `key` which is assigned to `request.pre.args`
exports.parseKey = (request, h) => {
  if (!request.query.arg) {
    throw Boom.badRequest("Argument 'key' is required")
  }

  try {
    return { key: new CID(request.query.arg) }
  } catch (err) {
    log.error(err)
    throw Boom.badRequest('invalid ipfs ref path')
  }
}

exports.new = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  async handler (request, h) {
    const { ipfs } = request.server.app
    const template = request.query.arg

    let cid, node
    try {
      cid = await ipfs.object.new(template)
      node = await ipfs.object.get(cid)
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to create object' })
    }

    const nodeJSON = node.toJSON()

    const answer = {
      Data: nodeJSON.data,
      Hash: cidToString(cid, { base: request.query['cid-base'], upgrade: false }),
      Size: nodeJSON.size,
      Links: nodeJSON.links.map((l) => {
        return {
          Name: l.name,
          Size: l.size,
          Hash: cidToString(l.cid, { base: request.query['cid-base'], upgrade: false })
        }
      })
    }

    return h.response(answer)
  }
}

exports.get = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { key } = request.pre.args
    const enc = request.query.enc || 'base58'
    const { ipfs } = request.server.app

    let node, cid
    try {
      node = await ipfs.object.get(key, { enc: enc })
      cid = await dagPB.util.cid(dagPB.util.serialize(node))
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to get object' })
    }

    const nodeJSON = node.toJSON()

    if (Buffer.isBuffer(node.data)) {
      nodeJSON.data = node.data.toString(request.query['data-encoding'] || undefined)
    }

    const answer = {
      Data: nodeJSON.data,
      Hash: cidToString(cid, { base: request.query['cid-base'], upgrade: false }),
      Size: nodeJSON.size,
      Links: nodeJSON.links.map((l) => {
        return {
          Name: l.name,
          Size: l.size,
          Hash: cidToString(l.cid, { base: request.query['cid-base'], upgrade: false })
        }
      })
    }

    return h.response(answer)
  }
}

exports.put = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  // pre request handler that parses the args and returns `node`
  // which is assigned to `request.pre.args`
  async parseArgs (request, h) {
    if (!request.payload) {
      throw Boom.badRequest("File argument 'data' is required")
    }

    const enc = request.query.inputenc
    let data

    for await (const part of multipart(request)) {
      if (part.type !== 'file') {
        continue
      }

      data = Buffer.concat(await all(part.content))
    }

    if (!data) {
      throw Boom.badRequest("File argument 'data' is required")
    }

    if (enc === 'protobuf') {
      try {
        return { node: await dagPB.util.deserialize(data) }
      } catch (err) {
        throw Boom.badRequest('Failed to deserialize: ' + err)
      }
    }

    let nodeJson
    try {
      nodeJson = JSON.parse(data.toString())
    } catch (err) {
      throw Boom.badRequest('Failed to parse the JSON: ' + err)
    }

    try {
      return { node: new DAGNode(nodeJson.Data, nodeJson.Links) }
    } catch (err) {
      throw Boom.badRequest('Failed to create DAG node: ' + err)
    }
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { node } = request.pre.args

    let cid
    try {
      cid = await ipfs.object.put(node)
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to put node' })
    }

    const nodeJSON = node.toJSON()

    const answer = {
      Data: nodeJSON.data,
      Hash: cidToString(cid, { base: request.query['cid-base'], upgrade: false }),
      Size: nodeJSON.size,
      Links: nodeJSON.links.map((l) => {
        return {
          Name: l.name,
          Size: l.size,
          Hash: cidToString(l.cid, { base: request.query['cid-base'], upgrade: false })
        }
      })
    }

    return h.response(answer)
  }
}

exports.stat = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { key } = request.pre.args

    let stats
    try {
      stats = await ipfs.object.stat(key)
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to stat object' })
    }

    stats.Hash = cidToString(stats.Hash, { base: request.query['cid-base'], upgrade: false })

    return h.response(stats)
  }
}

exports.data = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { key } = request.pre.args

    let data
    try {
      data = await ipfs.object.data(key)
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to get object data' })
    }

    return h.response(data)
  }
}

exports.links = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { key } = request.pre.args
    const response = {
      Hash: cidToString(key, { base: request.query['cid-base'], upgrade: false })
    }
    const links = await ipfs.object.links(key)

    if (links) {
      response.Links = links.map((l) => {
        return {
          Name: l.Name,
          Size: l.Tsize,
          Hash: cidToString(l.Hash, { base: request.query['cid-base'], upgrade: false })
        }
      })
    }

    return h.response(response)
  }
}

// common pre request handler that parses the args and returns `data` & `key` which are assigned to `request.pre.args`
exports.parseKeyAndData = async (request, h) => {
  if (!request.query.arg) {
    throw Boom.badRequest("Argument 'root' is required")
  }

  if (!request.payload) {
    throw Boom.badRequest("File argument 'data' is required")
  }

  // TODO: support ipfs paths: https://github.com/ipfs/http-api-spec/pull/68/files#diff-2625016b50d68d922257f74801cac29cR3880
  let cid
  try {
    cid = new CID(request.query.arg)
  } catch (err) {
    throw Boom.badRequest('invalid ipfs ref path')
  }

  let data

  for await (const part of multipart(request)) {
    if (part.type !== 'file') {
      continue
    }

    data = Buffer.concat(await all(part.content))
  }

  if (!data) {
    throw Boom.badRequest("File argument 'data' is required")
  }

  return { data, key: cid }
}

exports.patchAppendData = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  // uses common parseKeyAndData method that returns a `data` & `key`
  parseArgs: exports.parseKeyAndData,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { key, data } = request.pre.args

    let cid, node
    try {
      cid = await ipfs.object.patch.appendData(key, data)
      node = await ipfs.object.get(cid)
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to append data to object' })
    }

    const nodeJSON = node.toJSON()

    const answer = {
      Data: nodeJSON.data,
      Hash: cidToString(cid, { base: request.query['cid-base'], upgrade: false }),
      Size: nodeJSON.size,
      Links: nodeJSON.links.map((l) => {
        return {
          Name: l.name,
          Size: l.size,
          Hash: cidToString(l.cid, { base: request.query['cid-base'], upgrade: false })
        }
      })
    }

    return h.response(answer)
  }
}

exports.patchSetData = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  // uses common parseKeyAndData method that returns a `data` & `key`
  parseArgs: exports.parseKeyAndData,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { key, data } = request.pre.args

    let cid, node
    try {
      cid = await ipfs.object.patch.setData(key, data)
      node = await ipfs.object.get(cid)
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to set data on object' })
    }

    const nodeJSON = node.toJSON()

    return h.response({
      Hash: cidToString(cid, { base: request.query['cid-base'], upgrade: false }),
      Links: nodeJSON.links.map((l) => {
        return {
          Name: l.name,
          Size: l.size,
          Hash: cidToString(l.cid, { base: request.query['cid-base'], upgrade: false })
        }
      })
    })
  }
}

exports.patchAddLink = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  // pre request handler that parses the args and returns `root`, `name` & `ref` which is assigned to `request.pre.args`
  parseArgs: (request, reply) => {
    if (!(request.query.arg instanceof Array) ||
        request.query.arg.length !== 3) {
      throw Boom.badRequest("Arguments 'root', 'name' & 'ref' are required")
    }

    if (!request.query.arg[0]) {
      throw Boom.badRequest('cannot create link with no root')
    }

    if (!request.query.arg[1]) {
      throw Boom.badRequest('cannot create link with no name!')
    }

    if (!request.query.arg[2]) {
      throw Boom.badRequest('cannot create link with no ref')
    }

    try {
      return {
        root: new CID(request.query.arg[0]),
        name: request.query.arg[1],
        ref: new CID(request.query.arg[2])
      }
    } catch (err) {
      log.error(err)
      throw Boom.badRequest('invalid ipfs ref path')
    }
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { root, name, ref } = request.pre.args

    let node, cid
    try {
      node = await ipfs.object.get(ref)
      cid = await ipfs.object.patch.addLink(root, new DAGLink(name, node.size, ref))
      node = await ipfs.object.get(cid)
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to add link to object' })
    }

    const nodeJSON = node.toJSON()

    const answer = {
      Data: nodeJSON.data,
      Hash: cidToString(cid, { base: request.query['cid-base'], upgrade: false }),
      Size: nodeJSON.size,
      Links: nodeJSON.links.map((l) => {
        return {
          Name: l.name,
          Size: l.size,
          Hash: cidToString(l.cid, { base: request.query['cid-base'], upgrade: false })
        }
      })
    }

    return h.response(answer)
  }
}

exports.patchRmLink = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names)
    }).unknown()
  },

  // pre request handler that parses the args and returns `root` & `link` which is assigned to `request.pre.args`
  parseArgs (request, h) {
    if (!(request.query.arg instanceof Array) ||
        request.query.arg.length !== 2) {
      throw Boom.badRequest("Arguments 'root' & 'link' are required")
    }

    if (!request.query.arg[1]) {
      throw Boom.badRequest('cannot remove link with no name!')
    }

    try {
      return {
        root: new CID(request.query.arg[0]),
        link: request.query.arg[1]
      }
    } catch (err) {
      log.error(err)
      throw Boom.badRequest('invalid ipfs ref path')
    }
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { root, link } = request.pre.args

    let cid, node
    try {
      cid = await ipfs.object.patch.rmLink(root, { name: link })
      node = await ipfs.object.get(cid)
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to remove link from object' })
    }

    const nodeJSON = node.toJSON()

    const answer = {
      Data: nodeJSON.data,
      Hash: cidToString(cid, { base: request.query['cid-base'], upgrade: false }),
      Size: nodeJSON.size,
      Links: nodeJSON.links.map((l) => {
        return {
          Name: l.name,
          Size: l.size,
          Hash: cidToString(l.cid, { base: request.query['cid-base'], upgrade: false })
        }
      })
    }

    return h.response(answer)
  }
}
