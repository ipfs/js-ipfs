import { CID } from 'multiformats/cid'
import parseDuration from 'parse-duration'
import { multiaddr } from '@multiformats/multiaddr'
import { toCidAndPath } from 'ipfs-core-utils/to-cid-and-path'
import Joi from 'joi'
import { peerIdFromString } from '@libp2p/peer-id'

/**
 * @param {*} value
 */
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
  parts[0] = CID.parse(parts[0])

  // go-ipfs returns /ipfs/ prefix for ipfs paths when passed to the http api
  // and not when it isn't.  E.g.
  // GET /api/v0/ls?arg=/ipfs/Qmfoo  -> /ipfs/Qmfoo will be in the result
  // GET /api/v0/ls?arg=Qmfoo  -> Qmfoo will be in the result
  return `${startedWithIpfs ? '/ipfs/' : ''}${parts.join('/')}`
}

/**
 * @param {*} value
 */
const toCID = (value) => {
  return CID.parse(value.toString().replace('/ipfs/', ''))
}

/**
 * @param {*} value
 * @param {import('joi').CustomHelpers} helpers
 */
const requireIfRequired = (value, helpers) => {
  if (helpers.schema.$_getFlag('presence') === 'required' && !value) {
    return { value, errors: helpers.error('required') }
  }
}

export default Joi
  .extend(
    // @ts-expect-error - according to typedefs coerce should always return
    // { errors?: ErrorReport[], value?: any }
    (joi) => {
      return {
        type: 'cid',
        base: joi.any(),
        validate: requireIfRequired,
        coerce (value, _helpers) {
          if (!value) {
            return
          }

          return { value: toCID(value) }
        }
      }
    },
    (joi) => {
      return {
        type: 'peerId',
        base: joi.any(),
        validate: requireIfRequired,
        coerce (value, _helpers) {
          if (!value) {
            return
          }

          return { value: peerIdFromString(value) }
        }
      }
    },
    (joi) => {
      return {
        type: 'ipfsPath',
        base: joi.string(),
        validate: requireIfRequired,
        coerce (value, _helpers) {
          if (!value) {
            return
          }

          return { value: toIpfsPath(value) }
        }
      }
    },
    (joi) => {
      return {
        type: 'multiaddr',
        base: joi.string(),
        validate: requireIfRequired,
        coerce (value, _helpers) {
          if (!value) {
            return
          }

          return { value: multiaddr(value).toString() }
        }
      }
    },
    (joi) => {
      return {
        type: 'timeout',
        base: joi.number(),
        validate: requireIfRequired,
        coerce (value, _helpers) {
          if (!value) {
            return
          }

          return { value: parseDuration(value) }
        }
      }
    },
    (joi) => {
      return {
        type: 'cidAndPath',
        base: joi.any(),
        validate: requireIfRequired,
        coerce (value, _helpers) {
          if (!value) {
            return
          }

          return { value: toCidAndPath(value) }
        }
      }
    },
    (joi) => {
      return {
        type: 'json',
        base: joi.any(),
        validate: requireIfRequired,
        coerce (value, _helpers) {
          if (!value) {
            return
          }

          return { value: JSON.parse(value) }
        }
      }
    })
