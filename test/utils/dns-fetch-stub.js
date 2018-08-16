'use strict'

// Create a fetch stub with a fall through to the provided fetch implementation
// if the URL doesn't match https://ipfs.io/api/v0/dns?arg=ipfs.io.
module.exports = (fetch) => {
  return function () {
    if (arguments[0].startsWith('https://ipfs.io/api/v0/dns?arg=ipfs.io')) {
      return Promise.resolve({
        json: () => Promise.resolve({
          Path: '/ipfs/QmYNQJoKGNHTpPxCBPh9KkDpaExgd2duMa3aF6ytMpHdao'
        })
      })
    }
    return fetch.apply(this, arguments)
  }
}
