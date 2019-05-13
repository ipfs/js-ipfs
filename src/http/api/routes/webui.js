'use strict'

const resources = require('../../gateway/resources')

module.exports = [
  {
    method: '*',
    path: '/ipfs/{cid*}',
    options: {
      pre: [
        { method: resources.gateway.checkCID, assign: 'args' }
      ]
    },
    handler: resources.gateway.handler
  },
  {
    method: '*',
    path: '/webui',
    handler (request, h) {
      return h.redirect('/ipfs/QmUa2QBGU5sGcVpAHfw5BrgaMQeHHfiSM6xJtibZMnuHDa')
    }
  }
]
