'use strict'

const Block = require('ipfs-block')
const multihash = require('multihashes')
const multihashing = require('multihashing-async')
const CID = require('cids')
const waterfall = require('async/waterfall')
const setImmediate = require('async/setImmediate')
const promisify = require('promisify-es6')
const errCode = require('err-code')
const {
  readFileFromRequestPayload,
  readFileFromPathOrStdin
} = require('./api-shared')

module.exports = function block (self) {
  return {
    get: promisify((cid, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      try {
        cid = cleanCid(cid)
      } catch (err) {
        return setImmediate(() => callback(errCode(err, 'ERR_INVALID_CID')))
      }

      // Should be preload === true
      if (options.preload !== false) {
        self._preload(cid)
      }

      // options is ignored?
      self._blockService.get(cid, callback)
    }),
    put: promisify((block, options, callback) => {
      callback = callback || function noop () {}

      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      if (Array.isArray(block)) {
        return callback(new Error('Array is not supported'))
      }

      waterfall([
        (cb) => {
          if (Block.isBlock(block)) {
            return cb(null, block)
          }

          if (options.cid && CID.isCID(options.cid)) {
            return cb(null, new Block(block, options.cid))
          }

          const mhtype = options.mhtype || 'sha2-256'
          const format = options.format || 'dag-pb'
          const cidVersion = options.version || 0
          // const mhlen = options.mhlen || 0

          multihashing(block, mhtype, (err, multihash) => {
            if (err) {
              return cb(err)
            }

            cb(null, new Block(block, new CID(cidVersion, format, multihash)))
          })
        },
        (block, cb) => self._blockService.put(block, (err) => {
          if (err) {
            return cb(err)
          }

          if (options.preload !== false) {
            self._preload(block.cid)
          }

          cb(null, block)
        })
      ], callback)
    }),
    rm: promisify((cid, callback) => {
      try {
        cid = cleanCid(cid)
      } catch (err) {
        return setImmediate(() => callback(errCode(err, 'ERR_INVALID_CID')))
      }
      self._blockService.delete(cid, callback)
    }),
    stat: promisify((cid, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      try {
        cid = cleanCid(cid)
      } catch (err) {
        return setImmediate(() => callback(errCode(err, 'ERR_INVALID_CID')))
      }

      if (options.preload !== false) {
        self._preload(cid)
      }

      self._blockService.get(cid, (err, block) => {
        if (err) {
          return callback(err)
        }
        callback(null, {
          key: multihash.toB58String(cid.multihash),
          size: block.data.length
        })
      })
    })
  }
}

const getKey = (request, reply) => {
  return reply({
    key: new CID(request.query.arg)
  })
}
module.exports._getKey = getKey

const getBlock = (blockApi, cid, callback) => {
  try {
    cid = cleanCid(cid)
  } catch (err) {
    return callback(err)
  }
  return blockApi.get(cid, callback)
}

module.exports.__api = {
  name: 'block',
  cli: 'block <command>',
  description: 'Manipulate raw IPFS blocks',
  children: [
    {
      name: 'get',
      description: 'Get a raw IPFS block',
      args: ['key'],
      preload: true,
      call: (self, cid, options, callback) => {
        return getBlock(self.block, cid, callback)
      },
      http: {
        pre: getKey,
        post: (block) => {
          return block.data
        }
      },
      cli: {
        command: 'get <key>',
        post: (block, print) => {
          if (block) {
            print(block.data, false)
          } else {
            print('Block was unwanted before it could be remotely retrieved')
          }
        }
      },
      streamOutput: true
    },
    {
      name: 'put',
      description: 'Stores input as an IPFS block (accepts input via stdin)',
      args: ['data'],
      preload: true,
      payload: {
        parse: false,
        output: 'stream'
      },
      http: {
        pre: readFileFromRequestPayload,
        call: (self, data, options, callback) => {
          waterfall([
            (cb) => multihashing(data, 'sha2-256', (err, multihash) => {
              if (err) {
                return cb(err)
              }
              cb(null, new Block(data, new CID(multihash)))
            }),
            (block, cb) => {
              self.block.put(block, cb)
            }
          ], callback)
        },
        post: (block) => {
          return {
            Key: block.cid.toBaseEncodedString(),
            Size: block.data.length
          }
        }
      },
      cli: {
        command: 'put [block]',
        pre: readFileFromPathOrStdin('block'),
        call: (self, data, options, callback) => {
          waterfall([
            (cb) => multihashing(data, options.mhtype || 'sha2-256', cb),
            (multihash, cb) => {
              let cid
              if (options.format !== 'dag-pb' || options.version !== 0) {
                cid = new CID(1, options.format || 'dag-pb', multihash)
              } else {
                cid = new CID(0, 'dag-pb', multihash)
              }

              self.block.put(new Block(data, cid), (err) => {
                callback(err, cid)
              })
            }
          ], callback)
        },
        post: (cid, print) => {
          print(cid.toBaseEncodedString())
        },
        builder: {
          format: {
            alias: 'f',
            describe: 'cid format for blocks to be created with.',
            default: 'dag-pb'
          },
          mhtype: {
            describe: 'multihash hash function',
            default: 'sha2-256'
          },
          mhlen: {
            describe: 'multihash hash length',
            default: undefined
          },
          version: {
            describe: 'cid version',
            type: 'number',
            default: 0
          }
        }
      }
    },
    // rm: {},
    {
      name: 'stat',
      description: 'Print information of a raw IPFS block',
      args: ['key'],
      preload: false,
      call: (self, cid, options, callback) => {
        return getBlock(self.block, cid, (err, block) => {
          if (err) return callback(err)
          callback(null, {
            key: multihash.toB58String(block.cid.multihash),
            size: block.data.length
          })
        })
      },
      cli: {
        command: 'stat <key>',
        post: (stats, print) => {
          print('Key: ' + stats.key)
          print('Size: ' + stats.size)
        }
      },
      http: {
        pre: getKey,
        post: (stats) => {
          return {
            Key: stats.key,
            Size: stats.size
          }
        }
      }
    }
  ]
}

function cleanCid (cid) {
  if (CID.isCID(cid)) {
    return cid
  }

  // CID constructor knows how to do the cleaning :)
  return new CID(cid)
}
