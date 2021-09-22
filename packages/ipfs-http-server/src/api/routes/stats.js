import {
  bitswapResource,
  repoResource,
  bwResource
} from '../resources/stats.js'

export default [
  {
    method: 'POST',
    path: '/api/v0/stats/bitswap',
    ...bitswapResource
  },
  {
    method: 'POST',
    path: '/api/v0/stats/repo',
    ...repoResource
  },
  {
    method: 'POST',
    path: '/api/v0/stats/bw',
    ...bwResource
  }
]
