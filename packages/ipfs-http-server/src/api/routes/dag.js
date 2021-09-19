import {
  exportResource,
  getResource,
  importResource,
  putResource,
  resolveResource
} from '../resources/dag'

export default [
  {
    method: 'POST',
    path: '/api/v0/dag/export',
    ...exportResource
  },
  {
    method: 'POST',
    path: '/api/v0/dag/get',
    ...getResource
  },
  {
    method: 'POST',
    path: '/api/v0/dag/import',
    ...importResource
  },
  {
    method: 'POST',
    path: '/api/v0/dag/put',
    ...putResource
  },
  {
    method: 'POST',
    path: '/api/v0/dag/resolve',
    ...resolveResource
  }
]
