'use strict'

const { expect } = require('aegir/utils/chai')
const http = require('./http')

const METHODS = [
  'GET',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
  'HEAD'
]

module.exports = async (url, ipfs) => {
  for (let i = 0; i < METHODS.length; i++) {
    const res = await http({
      method: METHODS[i],
      url
    }, { ipfs })

    expect(res).to.have.property('statusCode', 405)
  }
}
