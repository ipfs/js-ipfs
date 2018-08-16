/* eslint-env browser */
'use strict'

const _fetch = typeof self === 'undefined' ? null : self.fetch

module.exports = () => {
  return function () {
    if (arguments[0].startsWith('https://ipfs.io/api/v0/dns?arg=ipfs.io')) {
      return Promise.resolve({
        json: () => Promise.resolve({
          Path: '/ipfs/QmYNQJoKGNHTpPxCBPh9KkDpaExgd2duMa3aF6ytMpHdao'
        })
      })
    }
    return _fetch.apply(this, arguments)
  }
}
