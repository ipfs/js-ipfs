import { multiaddr } from '@multiformats/multiaddr'
import { multiaddrToUri } from '@multiformats/multiaddr-to-uri'

/**
 * @typedef {import('@multiformats/multiaddr').Multiaddr} Multiaddr
 */

/**
 * @param {string|Multiaddr|URL} url - A string, multiaddr or URL to convert to a url string
 * @returns {string}
 */
export function toUrlString (url) {
  try {
    // @ts-expect-error
    url = multiaddrToUri(multiaddr(url))
  } catch (/** @type {any} */ err) { }

  url = url.toString()

  return url
}
