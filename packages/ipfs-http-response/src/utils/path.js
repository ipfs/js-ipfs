/* eslint-disable no-unused-vars */

/**
 * Converts path or url to an array starting at CID
 *
 * @param {string} path
 */
export function cidArray (path) {
  if (path[path.length - 1] === '/') {
    path = path.substring(0, path.length - 1)
  }
  // skip /ipxs/ prefix
  if (path.match(/^\/ip[fn]s\//)) {
    path = path.substring(6)
  }
  // skip ipxs:// protocol
  if (path.match(/^ip[fn]s:\/\//)) {
    path = path.substring(7)
  }
  return path.split('/')
}

/**
 * @param {string} url
 */
export function removeLeadingSlash (url) {
  if (url[0] === '/') {
    url = url.substring(1)
  }

  return url
}

/**
 * @param {string} url
 */
export function removeTrailingSlash (url) {
  if (url.endsWith('/')) {
    url = url.substring(0, url.length - 1)
  }

  return url
}

/**
 * @param {string} url
 */
export function removeSlashFromBothEnds (url) {
  url = removeLeadingSlash(url)
  url = removeTrailingSlash(url)

  return url
}

/**
 * @param {string[]} urls
 */
export function joinURLParts (...urls) {
  urls = urls.filter((url) => url.length > 0)
  urls = [''].concat(urls.map((url) => removeSlashFromBothEnds(url)))

  return urls.join('/')
}
