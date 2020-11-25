'use strict'

const multiaddr = require('multiaddr')
const multiAddrToUri = require('multiaddr-to-uri')

/**
 * @param {string|Multiaddr|URL} url - A string, multiaddr or URL to convert to a url string
 * @returns {string}
 */
module.exports = (url) => {
  try {
    // @ts-expect-error
    url = multiAddrToUri(multiaddr(url))
  } catch (err) { }

  url = url.toString()

  return url
}

/**
 * @typedef {import('multiaddr')} Multiaddr
 */
