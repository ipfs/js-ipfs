import { multipartRequestParser } from '../../utils/multipart-request-parser.js'
import all from 'it-all'
import * as dagPB from '@ipld/dag-pb'
import Joi from '../../utils/joi.js'
import Boom from '@hapi/boom'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { logger } from '@libp2p/logger'
import { CID } from 'multiformats/cid'
import { base64pad } from 'multiformats/bases/base64'
import { base16 } from 'multiformats/bases/base16'

const log = logger('ipfs:http-api:object')

/**
 * @type {Record<string, (str: string) => Uint8Array>}
 */
const DECODINGS = {
  ascii: (str) => uint8ArrayFromString(str),
  utf8: (str) => uint8ArrayFromString(str),
  base64pad: (str) => base64pad.decode(`M${str}`),
  base16: (str) => base16.decode(`f${str}`)
}

/**
 * @param {import('../../types').Request} request
 * @param {import('@hapi/hapi').ResponseToolkit} _h
 */
const readFilePart = async (request, _h) => {
  if (!request.payload) {
    throw Boom.badRequest("File argument 'data' is required")
  }

  let data

  for await (const part of multipartRequestParser(request.raw.req)) {
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
    } catch (/** @type {any} */ err) {
      log(err)
      throw Boom.badRequest("File argument 'data' is required")
    }
  }

  return {
    data
  }
}

export const newResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        template: Joi.string().valid('unixfs-dir'),
        cidBase: Joi.string().default('base32'),
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

    let cid, block, node
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
      block = dagPB.encode(node)
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to create object' })
    }

    const base = await ipfs.bases.getBase(cidBase)
    const base58 = await ipfs.bases.getBase('base58btc')

    const answer = {
      Data: node.Data ? uint8ArrayToString(node.Data, 'base64pad') : '',
      Hash: cid.toString(cid.version === 1 ? base.encoder : base58.encoder),
      Size: block.length,
      Links: node.Links.map((l) => {
        return {
          Name: l.Name,
          Size: l.Tsize,
          Hash: l.Hash.toString(l.Hash.version === 1 ? base.encoder : base58.encoder)
        }
      })
    }

    return h.response(answer)
  }
}

export const getResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cid: Joi.cid().required(),
        cidBase: Joi.string().default('base32'),
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

    let node, block
    try {
      node = await ipfs.object.get(cid, {
        signal,
        timeout
      })
      block = dagPB.encode(node)
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to get object' })
    }

    const base = await ipfs.bases.getBase(cidBase)
    const base58 = await ipfs.bases.getBase('base58btc')

    return h.response({
      Data: node.Data ? uint8ArrayToString(node.Data, dataEncoding) : '',
      Hash: cid.toString(cid.version === 1 ? base.encoder : base58.encoder),
      Size: block.length,
      Links: node.Links.map((l) => {
        return {
          Name: l.Name,
          Size: l.Tsize,
          Hash: l.Hash.toString(l.Hash.version === 1 ? base.encoder : base58.encoder)
        }
      })
    })
  }
}

export const putResource = {
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
        cidBase: Joi.string().default('base32'),
        dataEncoding: Joi.string()
          .valid('ascii', 'base64pad', 'base16', 'utf8')
          .replace(/text/, 'ascii')
          .replace(/base64/, 'base64pad')
          .replace(/hex/, 'base16')
          .default('base64pad'),
        enc: Joi.string().valid('json', 'protobuf').default('json'),
        pin: Joi.boolean().default(false),
        timeout: Joi.timeout()
      })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
        .rename('datafieldenc', 'dataEncoding', {
          override: true,
          ignoreUndefined: true
        })
        .rename('inputenc', 'enc', {
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
        enc,
        cidBase,
        dataEncoding,
        timeout,
        pin
      }
    } = request

    /** @type {import('@ipld/dag-pb').PBNode} */
    let input

    if (enc === 'json') {
      input = {
        Data: data.Data ? DECODINGS[dataEncoding](data.Data) : undefined,
        Links: (data.Links || []).map((/** @type {any} */ l) => {
          return {
            Name: l.Name || '',
            Tsize: l.Size || l.Tsize || 0,
            Hash: CID.parse(l.Hash)
          }
        })
      }
    } else {
      input = dagPB.decode(data)
    }

    let cid, node, block
    try {
      cid = await ipfs.object.put(input, {
        signal,
        timeout,
        pin
      })
      node = await ipfs.object.get(cid, {
        signal,
        timeout
      })
      block = dagPB.encode(node)
    } catch (/** @type {any} */ err) {
      throw Boom.badRequest(err, { message: 'Failed to put node' })
    }

    const base = await ipfs.bases.getBase(cidBase)
    const base58 = await ipfs.bases.getBase('base58btc')

    const answer = {
      Data: node.Data ? uint8ArrayToString(node.Data, dataEncoding) : '',
      Hash: cid.toString(cid.version === 1 ? base.encoder : base58.encoder),
      Size: block.length,
      Links: node.Links.map((l) => {
        return {
          Name: l.Name,
          Size: l.Tsize,
          Hash: l.Hash.toString(l.Hash.version === 1 ? base.encoder : base58.encoder)
        }
      })
    }

    return h.response(answer)
  }
}

export const statResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cid: Joi.cid().required(),
        cidBase: Joi.string().default('base32'),
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
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to stat object' })
    }

    const base = await ipfs.bases.getBase(cidBase)
    const base58 = await ipfs.bases.getBase('base58btc')

    return h.response({
      ...stats,
      Hash: stats.Hash.toString(stats.Hash.version === 1 ? base.encoder : base58.encoder)
    })
  }
}

export const dataResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cid: Joi.cid().required(),
        cidBase: Joi.string().default('base32'),
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
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to get object data' })
    }

    return h.response(data)
  }
}

export const linksResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cid: Joi.cid().required(),
        cidBase: Joi.string().default('base32'),
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

    const base = await ipfs.bases.getBase(cidBase)
    const base58 = await ipfs.bases.getBase('base58btc')

    const response = {
      Hash: cid.toString(cid.version === 1 ? base.encoder : base58.encoder),
      Links: (links || []).map((l) => {
        return {
          Name: l.Name,
          Size: l.Tsize,
          Hash: l.Hash.toString(l.Hash.version === 1 ? base.encoder : base58.encoder)
        }
      })
    }

    return h.response(response)
  }
}

export const patchAppendDataResource = {
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
        cidBase: Joi.string().default('base32'),
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
      pre: {
        args: {
          data
        }
      },
      query: {
        cid,
        cidBase,
        dataEncoding,
        timeout
      }
    } = request

    let newCid, node, block
    try {
      newCid = await ipfs.object.patch.appendData(cid, data, {
        signal,
        timeout
      })
      node = await ipfs.object.get(newCid, {
        signal,
        timeout
      })
      block = dagPB.encode(node)
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to append data to object' })
    }

    const base = await ipfs.bases.getBase(cidBase)
    const base58 = await ipfs.bases.getBase('base58btc')

    const answer = {
      Data: node.Data ? uint8ArrayToString(node.Data, dataEncoding) : '',
      Hash: newCid.toString(newCid.version === 1 ? base.encoder : base58.encoder),
      Size: block.length,
      Links: node.Links.map((l) => {
        return {
          Name: l.Name,
          Size: l.Tsize,
          Hash: l.Hash.toString(l.Hash.version === 1 ? base.encoder : base58.encoder)
        }
      })
    }

    return h.response(answer)
  }
}

export const patchSetDataResource = {
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
        cidBase: Joi.string().default('base32'),
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
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to set data on object' })
    }

    const base = await ipfs.bases.getBase(cidBase)
    const base58 = await ipfs.bases.getBase('base58btc')

    return h.response({
      Hash: newCid.toString(newCid.version === 1 ? base.encoder : base58.encoder),
      Links: node.Links.map((l) => {
        return {
          Name: l.Name,
          Size: l.Tsize,
          Hash: l.Hash.toString(l.Hash.version === 1 ? base.encoder : base58.encoder)
        }
      })
    })
  }
}

export const patchAddLinkResource = {
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
        cidBase: Joi.string().default('base32'),
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
        dataEncoding,
        timeout
      }
    } = request

    let node, cid, block
    try {
      node = await ipfs.object.get(ref, {
        signal,
        timeout
      })
      block = dagPB.encode(node)
      cid = await ipfs.object.patch.addLink(root, { Name: name, Tsize: block.length, Hash: ref }, {
        signal,
        timeout
      })
      node = await ipfs.object.get(cid, {
        signal,
        timeout
      })
      block = dagPB.encode(node)
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to add link to object' })
    }

    const base = await ipfs.bases.getBase(cidBase)
    const base58 = await ipfs.bases.getBase('base58btc')

    const answer = {
      Data: node.Data ? uint8ArrayToString(node.Data, dataEncoding) : '',
      Hash: cid.toString(cid.version === 1 ? base.encoder : base58.encoder),
      Size: block.length,
      Links: node.Links.map((l) => {
        return {
          Name: l.Name,
          Size: l.Tsize,
          Hash: l.Hash.toString(l.Hash.version === 1 ? base.encoder : base58.encoder)
        }
      })
    }

    return h.response(answer)
  }
}

export const patchRmLinkResource = {
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
        cidBase: Joi.string().default('base32'),
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
        dataEncoding,
        timeout
      }
    } = request

    let cid, node, block
    try {
      cid = await ipfs.object.patch.rmLink(root, link, {
        signal,
        timeout
      })
      node = await ipfs.object.get(cid, {
        signal,
        timeout
      })
      block = dagPB.encode(node)
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to remove link from object' })
    }

    const base = await ipfs.bases.getBase(cidBase)
    const base58 = await ipfs.bases.getBase('base58btc')

    const answer = {
      Data: node.Data ? uint8ArrayToString(node.Data, dataEncoding) : '',
      Hash: cid.toString(cid.version === 1 ? base.encoder : base58.encoder),
      Size: block.length,
      Links: node.Links.map((l) => {
        return {
          Name: l.Name,
          Size: l.Tsize,
          Hash: l.Hash.toString(l.Hash.version === 1 ? base.encoder : base58.encoder)
        }
      })
    }

    return h.response(answer)
  }
}
