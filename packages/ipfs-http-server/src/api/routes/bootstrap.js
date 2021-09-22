import {
  listResource,
  addResource,
  addDefaultResource,
  rmResource,
  rmAllResource
} from '../resources/bootstrap.js'

export default [
  {
    method: 'POST',
    path: '/api/v0/bootstrap',
    ...listResource
  },
  {
    method: 'POST',
    path: '/api/v0/bootstrap/add',
    ...addResource
  },
  {
    method: 'POST',
    path: '/api/v0/bootstrap/add/default',
    ...addDefaultResource
  },
  {
    method: 'POST',
    path: '/api/v0/bootstrap/list',
    ...listResource
  },
  {
    method: 'POST',
    path: '/api/v0/bootstrap/rm',
    ...rmResource
  },
  {
    method: 'POST',
    path: '/api/v0/bootstrap/rm/all',
    ...rmAllResource
  }
]
