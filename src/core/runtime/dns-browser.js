/* global self */
'use strict'

module.exports = (domain, opts, callback) => {
  if (typeof opts === 'function') {
    callback = opts
    opts = {}
  }

  opts = opts || {}

  domain = encodeURIComponent(domain)
  let url = `https://ipfs.io/api/v0/dns?arg=${domain}`

  Object.keys(opts).forEach(prop => {
    url += `&${encodeURIComponent(prop)}=${encodeURIComponent(opts[prop])}`
  })

  self.fetch(url, { mode: 'cors' })
    .then((response) => {
      return response.json()
    })
    .then((response) => {
      if (response.Path) {
        return callback(null, response.Path)
      } else {
        return callback(new Error(response.Message))
      }
    })
    .catch((error) => {
      callback(error)
    })
}
