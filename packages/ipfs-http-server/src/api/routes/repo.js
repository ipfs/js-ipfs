import {
  versionResource,
  statResource,
  gcResource
} from '../resources/repo.js'

export default [
  {
    method: 'POST',
    path: '/api/v0/repo/version',
    ...versionResource
  },
  {
    method: 'POST',
    path: '/api/v0/repo/stat',
    ...statResource
  },
  {
    method: 'POST',
    path: '/api/v0/repo/gc',
    ...gcResource
  }
]
