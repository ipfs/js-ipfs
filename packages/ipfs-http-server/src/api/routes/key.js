import {
  listResource,
  genResource,
  rmResource,
  renameResource,
  importResource
} from '../resources/key.js'

export default [
  {
    method: 'POST',
    path: '/api/v0/key/list',
    ...listResource
  },
  {
    method: 'POST',
    path: '/api/v0/key/gen',
    ...genResource
  },
  {
    method: 'POST',
    path: '/api/v0/key/rm',
    ...rmResource
  },
  {
    method: 'POST',
    path: '/api/v0/key/rename',
    ...renameResource
  },
  {
    method: 'POST',
    path: '/api/v0/key/import',
    ...importResource
  }
]
