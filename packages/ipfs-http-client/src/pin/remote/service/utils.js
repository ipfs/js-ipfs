/**
 * @typedef {import('ipfs-core-types/src/pin/remote/service').RemotePinServiceWithStat} RemotePinServiceWithStat
 */

/**
 * @param {URL} url
 */
export function encodeEndpoint (url) {
  const href = String(url)
  if (href === 'undefined') {
    throw Error('endpoint is required')
  }
  // Workaround trailing `/` issue in go-ipfs
  // @see https://github.com/ipfs/go-ipfs/issues/7826
  return href[href.length - 1] === '/' ? href.slice(0, -1) : href
}

/**
 * @param {any} json
 * @returns {RemotePinServiceWithStat}
 */
export function decodeRemoteService (json) {
  return {
    service: json.Service,
    endpoint: new URL(json.ApiEndpoint),
    ...(json.Stat && { stat: decodeStat(json.Stat) })
  }
}

/**
 * @param {any} json
 * @returns {import('ipfs-core-types/src/pin/remote/service').Stat}
 */
export function decodeStat (json) {
  switch (json.Status) {
    case 'valid': {
      const { Pinning, Pinned, Queued, Failed } = json.PinCount
      return {
        status: 'valid',
        pinCount: {
          queued: Queued,
          pinning: Pinning,
          pinned: Pinned,
          failed: Failed
        }
      }
    }
    case 'invalid': {
      return { status: 'invalid' }
    }
    default: {
      return { status: json.Status }
    }
  }
}
