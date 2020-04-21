'use strict'

const Joi = require('@hapi/joi')
const CID = require('cids')
const parseDuration = require('parse-duration')
const multiaddr = require('multiaddr')
const multibase = require('multibase')

const toIpfsPath = (value) => {
  if (!value) {
    throw new Error('Must have value')
  }

  value = value.toString()

  if (!value.startsWith('/ipfs/')) {
    value = `/ipfs/${value}`
  }

  // section after /ipfs/ should be a valid CID
  const parts = value.split('/')

  // will throw if not valid
  parts[2] = new CID(parts[2])

  return parts.join('/')
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

          value = value.toString()

          if (!value.startsWith('/ipfs/')) {
            value = `/ipfs/${value}`
          }

          // section after /ipfs/ should be a valid CID
          const parts = value.split('/')

          return {
            cid: new CID(parts[2]),
            path: parts.slice(3).join('/')
          }
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

          if (!multibase.names.includes(value)) {
            throw new Error('Invalid base name')
          }

          return value
        }
      }
    })
