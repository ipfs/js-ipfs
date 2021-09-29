import {
  getResource,
  putResource,
  rmResource,
  statResource
} from '../resources/block.js'

export default [
  {
    method: 'POST',
    path: '/api/v0/block/get',
    ...getResource
  },
  {
    method: 'POST',
    path: '/api/v0/block/put',
    ...putResource
  },
  {
    method: 'POST',
    path: '/api/v0/block/rm',
    ...rmResource
  },
  {
    method: 'POST',
    path: '/api/v0/block/stat',
    ...statResource
  }
]
