import { Multiaddr } from '@multiformats/multiaddr'
import { multiaddrToUri } from '@multiformats/multiaddr-to-uri'

/**
 * @param {string|Multiaddr|URL} url - A string, multiaddr or URL to convert to a url string
 * @returns {string}
 */
export function toUrlString (url) {
  try {
    // @ts-expect-error
    url = multiaddrToUri(new Multiaddr(url))
  } catch (/** @type {any} */ err) { }

  url = url.toString()

  return url
}
