import {
  findPeerResource,
  findProvsResource,
  getResource,
  provideResource,
  putResource,
  queryResource
} from '../resources/dht.js'

export default [
  {
    method: 'POST',
    path: '/api/v0/dht/findpeer',
    ...findPeerResource
  },
  {
    method: 'POST',
    path: '/api/v0/dht/findprovs',
    ...findProvsResource
  },
  {
    method: 'POST',
    path: '/api/v0/dht/get',
    ...getResource
  },
  {
    method: 'POST',
    path: '/api/v0/dht/provide',
    ...provideResource
  },
  {
    method: 'POST',
    path: '/api/v0/dht/put',
    ...putResource
  },
  {
    method: 'POST',
    path: '/api/v0/dht/query',
    ...queryResource
  }
]
