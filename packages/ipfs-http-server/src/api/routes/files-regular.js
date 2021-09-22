import {
  catResource,
  getResource,
  addResource,
  lsResource,
  refsResource,
  refsLocalResource
} from '../resources/files-regular.js'

export default [
  {
    method: 'POST',
    path: '/api/v0/cat',
    ...catResource
  },
  {
    method: 'POST',
    path: '/api/v0/get',
    ...getResource
  },
  {
    method: 'POST',
    path: '/api/v0/add',
    ...addResource
  },
  {
    method: 'POST',
    path: '/api/v0/ls',
    ...lsResource
  },
  {
    method: 'POST',
    path: '/api/v0/refs',
    ...refsResource
  },
  {
    method: 'POST',
    path: '/api/v0/refs/local',
    ...refsLocalResource
  }
]
