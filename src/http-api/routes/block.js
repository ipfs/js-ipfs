const resources = require('./../resources')
const Joi = require('joi')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: 'GET',
    path: '/api/v0/block/get/{arg?}',
    handler: resources.block.get,
    config: {
      validate: {
        query: {
          arg: Joi.string().required() // The base58 multihash of an existing block to get.
        }
      }
    }
  })

  api.route({
    method: 'POST',
    path: '/api/v0/block/put/{arg?}',
    handler: resources.block.put,
    config: {
      validate: {
        query: {
          arg: Joi.string().required() // The data to be stored as an IPFS block.
        }
      }
    }
  })

  api.route({
    method: 'DELETE',
    path: '/api/v0/block/del/{arg?}',
    handler: resources.block.del,
    config: {
      validate: {
        query: {
          arg: Joi.string().required() // The base58 multihash of the IPFS block to be removed.
        }
      }
    }
  })

  api.route({
    method: 'GET',
    path: '/api/v0/block/stat/{arg?}',
    handler: resources.block.stat,
    config: {
      validate: {
        query: {
          arg: Joi.string().required() // The base58 multihash of an existing block to get.
        }
      }
    }
  })
}
