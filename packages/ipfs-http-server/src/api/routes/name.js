import {
  resolveResource,
  publishResource,
  stateResource,
  pubsubSubsResource,
  pubsubCancelResource
} from '../resources/name.js'

export default [
  {
    method: 'POST',
    path: '/api/v0/name/resolve',
    ...resolveResource
  },
  {
    method: 'POST',
    path: '/api/v0/name/publish',
    ...publishResource
  },
  {
    method: 'POST',
    path: '/api/v0/name/pubsub/state',
    ...stateResource
  },
  {
    method: 'POST',
    path: '/api/v0/name/pubsub/subs',
    ...pubsubSubsResource
  },
  {
    method: 'POST',
    path: '/api/v0/name/pubsub/cancel',
    ...pubsubCancelResource
  }
]
