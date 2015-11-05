var ipfsAPIclt = require('ipfs-api')

exports = module.exports = IPFS

function IPFS () {
  var self = this

  if (!(self instanceof IPFS)) {
    throw new Error('Must be instantiated with new')
  }

  var config = {
    url: 'public-writable-node'
  }

  if (process.env.NODE_ENV === 'dev') {
    config.url = '/ip4/127.0.0.1/tcp/5001'
  }

  if (process.env.NODE_ENV === 'test') {
    config.url = process.env.APIURL
  }

  var api = ipfsAPIclt(config.url)

  return api
}
