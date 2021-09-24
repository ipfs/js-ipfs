import {
  wantlistResource,
  statResource,
  unwantResource
} from '../resources/bitswap.js'

export default [
  {
    method: 'POST',
    path: '/api/v0/bitswap/wantlist',
    ...wantlistResource
  },
  {
    method: 'POST',
    path: '/api/v0/bitswap/stat',
    ...statResource
  },
  {
    method: 'POST',
    path: '/api/v0/bitswap/unwant',
    ...unwantResource
  }
]
