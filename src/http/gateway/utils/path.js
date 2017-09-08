'use strict'

function splitPath (path) {
  if (path[path.length - 1] === '/') {
    path = path.substring(0, path.length - 1)
  }

  return path.substring(6).split('/')
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
  splitPath: splitPath,
  removeTrailingSlash: removeTrailingSlash,
  joinURLParts: joinURLParts
}
