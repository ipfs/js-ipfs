'use strict'

const Joi = require('@hapi/joi')
const CID = require('cids')
const parseDuration = require('parse-duration').default
const multiaddr = require('multiaddr')
const multibase = require('multibase')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')

const toIpfsPath = (value) => {
  if (!value) {
    throw new Error('Must have value')
  }

  value = value.toString()
  let startedWithIpfs = false

  if (value.startsWith('/ipfs/')) {
    startedWithIpfs = true
    value = value.replace(/^\/ipfs\//, '')
  }

  // section after /ipfs/ should be a valid CID
  const parts = value.split('/')

  // will throw if not valid
  parts[0] = new CID(parts[0])

  // go-ipfs returns /ipfs/ prefix for ipfs paths when passed to the http api
  // and not when it isn't.  E.g.
  // GET /api/v0/ls?arg=/ipfs/Qmfoo  -> /ipfs/Qmfoo will be in the result
  // GET /api/v0/ls?arg=Qmfoo  -> Qmfoo will be in the result
  return `${startedWithIpfs ? '/ipfs/' : ''}${parts.join('/')}`
}

const toCID = (value) => {
  return new CID(value.toString().replace('/ipfs/', ''))
}

module.exports = Joi
  .extend(
    (joi) => {
      return {
        name: 'cid',
        base: joi.any(),
        pre (value, state, options) {
          if (!value) {
            return
          }

          return toCID(value)
        }
      }
    },
    (joi) => {
      return {
        name: 'ipfsPath',
        base: joi.string(),
        coerce (value, state, options) {
          if (!value) {
            return
          }

          return toIpfsPath(value)
        }
      }
    },
    (joi) => {
      return {
        name: 'peerId',
        base: joi.string(),
        pre (value, state, options) {
          if (!value) {
            return
          }

          return new CID(value).toString()
        }
      }
    },
    (joi) => {
      return {
        name: 'multiaddr',
        base: joi.string(),
        pre (value, state, options) {
          if (!value) {
            return
          }

          return multiaddr(value).toString()
        }
      }
    },
    (joi) => {
      return {
        name: 'timeout',
        base: joi.string(),
        pre (value, state, options) {
          if (!value) {
            return
          }

          return parseDuration(value)
        }
      }
    },
    (joi) => {
      return {
        name: 'cidAndPath',
        base: joi.any(),
        pre (value, state, options) {
          if (!value) {
            return
          }

          return toCidAndPath(value)
        }
      }
    },
    (joi) => {
      return {
        name: 'cidBase',
        base: joi.string(),
        pre (value, state, options) {
          if (!value) {
            return
          }

          if (!multibase.names[value]) {
            throw new Error('Invalid base name')
          }

          return value
        }
      }
    })
