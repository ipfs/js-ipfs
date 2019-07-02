'use strict'

const resources = require('../../gateway/resources')

module.exports = [
  {
    method: '*',
    path: '/ipfs/{immutableId*}',
    options: {
      pre: [
        { method: resources.gateway.checkImmutableId, assign: 'args' }
      ]
    },
    handler: resources.gateway.handler
  },
  {
    method: '*',
    path: '/webui',
    handler (request, h) {
      return h.redirect('/ipfs/QmQNHd1suZTktPRhP7DD4nKWG46ZRSxkwHocycHVrK3dYW')
    }
  }
]
