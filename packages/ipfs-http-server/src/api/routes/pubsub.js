import {
  subscribeResource,
  publishResource,
  lsResource,
  peersResource
} from '../resources/pubsub.js'

export default [
  {
    method: 'POST',
    path: '/api/v0/pubsub/sub',
    ...subscribeResource
  },
  {
    method: 'POST',
    path: '/api/v0/pubsub/pub',
    ...publishResource
  },
  {
    method: 'POST',
    path: '/api/v0/pubsub/ls',
    ...lsResource
  },
  {
    method: 'POST',
    path: '/api/v0/pubsub/peers',
    ...peersResource
  }
]
