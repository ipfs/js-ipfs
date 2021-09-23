import {
  addResource,
  rmResource,
  lsResource
} from '../resources/pin.js'

export default [
  {
    method: 'POST',
    path: '/api/v0/pin/add',
    ...addResource
  },
  {
    method: 'POST',
    path: '/api/v0/pin/rm',
    ...rmResource
  },
  {
    method: 'POST',
    path: '/api/v0/pin/ls',
    ...lsResource
  }
]
