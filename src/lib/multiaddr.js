'use strict'

// Convert a multiaddr to a URI
// Assumes multiaddr is in a format that can be converted to a HTTP(s) URI
exports.toUri = ma => {
  const parts = `${ma}`.split('/')
  const port = getPort(parts)
  return `${getProtocol(parts)}://${parts[2]}${port == null ? '' : ':' + port}`
}

function getProtocol (maParts) {
  return maParts.indexOf('https') === -1 ? 'http' : 'https'
}

function getPort (maParts) {
  const tcpIndex = maParts.indexOf('tcp')
  return tcpIndex === -1 ? null : maParts[tcpIndex + 1]
}
