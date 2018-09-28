'use strict'

/* eslint-disable no-unused-vars */

// Converts path or url to an array starting at CID
function cidArray (path) {
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

function removeLeadingSlash (url) {
  if (url[0] === '/') {
    url = url.substring(1)
  }

  return url
}

function removeTrailingSlash (url) {
  if (url.endsWith('/')) {
    url = url.substring(0, url.length - 1)
  }

  return url
}

function removeSlashFromBothEnds (url) {
  url = removeLeadingSlash(url)
  url = removeTrailingSlash(url)

  return url
}

function joinURLParts (...urls) {
  urls = urls.filter((url) => url.length > 0)
  urls = [ '' ].concat(urls.map((url) => removeSlashFromBothEnds(url)))

  return urls.join('/')
}

module.exports = {
  cidArray,
  removeLeadingSlash,
  removeTrailingSlash,
  removeSlashFromBothEnds,
  joinURLParts
}
