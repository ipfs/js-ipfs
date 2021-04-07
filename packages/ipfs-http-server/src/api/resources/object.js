'use strict'

const multipart = require('../../utils/multipart-request-parser')
const all = require('it-all')
const dagPB = require('ipld-dag-pb')
const { DAGLink } = dagPB
const Joi = require('../../utils/joi')
const multibase = require('multibase')
const Boom = require('@hapi/boom')
const uint8ArrayToString = require('uint8arrays/to-string')
const { cidToString } = require('ipfs-core-utils/src/cid')
const debug = require('debug')
const log = Object.assign(debug('ipfs:http-api:object'), {
  error: debug('ipfs:http-api:object:error')
})

/**
 * @param {import('../../types').Request} request
 * @param {import('@hapi/hapi').ResponseToolkit} _h
 */
const readFilePart = async (request, _h) => {
  if (!request.payload) {
    throw Boom.badRequest("File argument 'data' is required")
  }

  let data

  for await (const part of multipart(request.raw.req)) {
    if (part.type !== 'file') {
      continue
    }

    data = Buffer.concat(await all(part.content))
  }

  if (!data) {
    throw Boom.badRequest("File argument 'data' is required")
  }

  if (request.query.enc === 'json') {
    try {
      data = JSON.parse(data.toString('utf8'))
    } catch (err) {
      log(err)
      throw Boom.badRequest("File argument 'data' is required")
    }
  }

  return {
    data
  }
}

exports.new = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        template: Joi.string().valid('unixfs-dir'),
        cidBase: Joi.cidBase(),
        timeout: Joi.timeout()
      })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
        .rename('arg', 'template', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        template,
        cidBase,
        timeout
      }
    } = request

    let cid, node
    try {
      cid = await ipfs.object.new({
        template,
        signal,
        timeout
      })
      node = await ipfs.object.get(cid, {
        signal,
        timeout
      })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to create object' })
    }

    const nodeJSON = node.toJSON()

    const answer = {
      Data: uint8ArrayToString(node.Data, 'base64pad'),
      Hash: cidToString(cid, { base: cidBase, upgrade: false }),
      Size: nodeJSON.size,
      Links: nodeJSON.links.map((l) => {
        return {
          Name: l.name,
          Size: l.size,
          Hash: cidToString(l.cid, { base: cidBase, upgrade: false })
        }
      })
    }

    return h.response(answer)
  }
}

exports.get = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cid: Joi.cid().required(),
        cidBase: Joi.cidBase(),
        dataEncoding: Joi.string()
          .valid('ascii', 'base64pad', 'base16', 'utf8')
          .replace(/text/, 'ascii')
          .replace(/base64/, 'base64pad')
          .replace(/hex/, 'base16')
          .default('base64pad'),
        timeout: Joi.timeout()
      })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
        .rename('data-encoding', 'dataEncoding', {
          override: true,
          ignoreUndefined: true
        })
        .rename('arg', 'cid', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        cid,
        cidBase,
        dataEncoding,
        timeout
      }
    } = request

    let node
    try {
      node = await ipfs.object.get(cid, {
        signal,
        timeout
      })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to get object' })
    }

    return h.response({
      Data: uint8ArrayToString(node.Data, dataEncoding),
      Hash: cidToString(cid, { base: cidBase, upgrade: false }),
      Size: node.size,
      Links: node.Links.map((l) => {
        return {
          Name: l.Name,
          Size: l.Tsize,
          Hash: cidToString(l.Hash, { base: cidBase, upgrade: false })
        }
      })
    })
  }
}

exports.put = {
  options: {
    payload: {
      parse: false,
      output: 'stream'
    },
    pre: [{
      assign: 'args',
      method: readFilePart
    }],
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cidBase: Joi.string().valid(...Object.keys(multibase.names)),
        enc: Joi.string().valid('json', 'protobuf'),
        timeout: Joi.timeout()
      })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      pre: {
        args: {
          data
        }
      },
      query: {
        cidBase,
        enc,
        timeout
      }
    } = request

    let cid, node
    try {
      cid = await ipfs.object.put(data, {
        enc,
        signal,
        timeout
      })
      node = await ipfs.object.get(cid, {
        signal,
        timeout
      })
    } catch (err) {
      throw Boom.badRequest(err, { message: 'Failed to put node' })
    }

    const nodeJSON = node.toJSON()

    const answer = {
      Data: nodeJSON.data,
      Hash: cidToString(cid, { base: cidBase, upgrade: false }),
      Size: nodeJSON.size,
      Links: nodeJSON.links.map((l) => {
        return {
          Name: l.name,
          Size: l.size,
          Hash: cidToString(l.cid, { base: cidBase, upgrade: false })
        }
      })
    }

    return h.response(answer)
  }
}

exports.stat = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cid: Joi.cid().required(),
        cidBase: Joi.cidBase(),
        timeout: Joi.timeout()
      })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
        .rename('arg', 'cid', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        cid,
        cidBase,
        timeout
      }
    } = request

    let stats
    try {
      stats = await ipfs.object.stat(cid, {
        signal,
        timeout
      })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to stat object' })
    }

    stats.Hash = cidToString(stats.Hash, { base: cidBase, upgrade: false })

    return h.response(stats)
  }
}

exports.data = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cid: Joi.cid().required(),
        cidBase: Joi.cidBase(),
        timeout: Joi.timeout()
      })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
        .rename('arg', 'cid', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        cid,
        timeout
      }
    } = request

    let data
    try {
      data = await ipfs.object.data(cid, {
        signal,
        timeout
      })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to get object data' })
    }

    return h.response(data)
  }
}

exports.links = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cid: Joi.cid().required(),
        cidBase: Joi.cidBase(),
        timeout: Joi.timeout()
      })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
        .rename('arg', 'cid', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        cid,
        cidBase,
        timeout
      }
    } = request

    const links = await ipfs.object.links(cid, {
      signal,
      timeout
    })

    const response = {
      Hash: cidToString(cid, { base: cidBase, upgrade: false }),
      Links: (links || []).map((l) => {
        return {
          Name: l.Name,
          Size: l.Tsize,
          Hash: cidToString(l.Hash, { base: cidBase, upgrade: false })
        }
      })
    }

    return h.response(response)
  }
}

exports.patchAppendData = {
  options: {
    payload: {
      parse: false,
      output: 'stream'
    },
    pre: [{
      assign: 'args',
      method: readFilePart
    }],
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cid: Joi.cid().required(),
        cidBase: Joi.cidBase(),
        timeout: Joi.timeout()
      })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
        .rename('data-encoding', 'dataEncoding', {
          override: true,
          ignoreUndefined: true
        })
        .rename('arg', 'cid', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      pre: {
        args: {
          data
        }
      },
      query: {
        cid,
        cidBase,
        timeout
      }
    } = request

    let newCid, node
    try {
      newCid = await ipfs.object.patch.appendData(cid, data, {
        signal,
        timeout
      })
      node = await ipfs.object.get(newCid, {
        signal,
        timeout
      })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to append data to object' })
    }

    const nodeJSON = node.toJSON()

    const answer = {
      Data: nodeJSON.data,
      Hash: cidToString(newCid, { base: cidBase, upgrade: false }),
      Size: nodeJSON.size,
      Links: nodeJSON.links.map((l) => {
        return {
          Name: l.name,
          Size: l.size,
          Hash: cidToString(l.cid, { base: cidBase, upgrade: false })
        }
      })
    }

    return h.response(answer)
  }
}

exports.patchSetData = {
  options: {
    payload: {
      parse: false,
      output: 'stream'
    },
    pre: [{
      assign: 'args',
      method: readFilePart
    }],
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cid: Joi.cid().required(),
        cidBase: Joi.cidBase(),
        timeout: Joi.timeout()
      })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
        .rename('arg', 'cid', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      pre: {
        args: {
          data
        }
      },
      query: {
        cid,
        cidBase,
        timeout
      }
    } = request

    let newCid, node
    try {
      newCid = await ipfs.object.patch.setData(cid, data, {
        signal,
        timeout
      })
      node = await ipfs.object.get(newCid, {
        signal: request.app.signal
      })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to set data on object' })
    }

    const nodeJSON = node.toJSON()

    return h.response({
      Hash: cidToString(newCid, { base: cidBase, upgrade: false }),
      Links: nodeJSON.links.map((l) => {
        return {
          Name: l.name,
          Size: l.size,
          Hash: cidToString(l.cid, { base: cidBase, upgrade: false })
        }
      })
    })
  }
}

exports.patchAddLink = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        args: Joi.array().length(3).ordered(
          Joi.cid().required(),
          Joi.string().required(),
          Joi.cid().required()
        ).required(),
        cidBase: Joi.cidBase(),
        timeout: Joi.timeout()
      })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
        .rename('arg', 'args', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        args: [
          root,
          name,
          ref
        ],
        cidBase,
        timeout
      }
    } = request

    let node, cid
    try {
      node = await ipfs.object.get(ref, {
        signal,
        timeout
      })
      cid = await ipfs.object.patch.addLink(root, new DAGLink(name, node.size, ref), {
        signal,
        timeout
      })
      node = await ipfs.object.get(cid, {
        signal,
        timeout
      })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to add link to object' })
    }

    const nodeJSON = node.toJSON()

    const answer = {
      Data: nodeJSON.data,
      Hash: cidToString(cid, { base: cidBase, upgrade: false }),
      Size: nodeJSON.size,
      Links: nodeJSON.links.map((l) => {
        return {
          Name: l.name,
          Size: l.size,
          Hash: cidToString(l.cid, { base: cidBase, upgrade: false })
        }
      })
    }

    return h.response(answer)
  }
}

exports.patchRmLink = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        args: Joi.array().length(2).ordered(
          Joi.cid().required(),
          Joi.string().required()
        ).required(),
        cidBase: Joi.cidBase(),
        timeout: Joi.timeout()
      })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
        .rename('arg', 'args', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        args: [
          root,
          link
        ],
        cidBase,
        timeout
      }
    } = request

    let cid, node
    try {
      cid = await ipfs.object.patch.rmLink(root, link, {
        signal,
        timeout
      })
      node = await ipfs.object.get(cid, {
        signal,
        timeout
      })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to remove link from object' })
    }

    const nodeJSON = node.toJSON()

    const answer = {
      Data: nodeJSON.data,
      Hash: cidToString(cid, { base: cidBase, upgrade: false }),
      Size: nodeJSON.size,
      Links: nodeJSON.links.map((l) => {
        return {
          Name: l.name,
          Size: l.size,
          Hash: cidToString(l.cid, { base: cidBase, upgrade: false })
        }
      })
    }

    return h.response(answer)
  }
}
