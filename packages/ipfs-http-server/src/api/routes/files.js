import {
  chmodResource,
  cpResource,
  flushResource,
  lsResource,
  mkdirResource,
  mvResource,
  readResource,
  rmResource,
  statResource,
  touchResource,
  writeResource
} from '../resources/files/index.js'

export default [
  {
    method: 'POST',
    path: '/api/v0/files/chmod',
    ...chmodResource
  },
  {
    method: 'POST',
    path: '/api/v0/files/cp',
    ...cpResource
  },
  {
    method: 'POST',
    path: '/api/v0/files/flush',
    ...flushResource
  },
  {
    method: 'POST',
    path: '/api/v0/files/ls',
    ...lsResource
  },
  {
    method: 'POST',
    path: '/api/v0/files/mkdir',
    ...mkdirResource
  },
  {
    method: 'POST',
    path: '/api/v0/files/mv',
    ...mvResource
  },
  {
    method: 'POST',
    path: '/api/v0/files/read',
    ...readResource
  },
  {
    method: 'POST',
    path: '/api/v0/files/rm',
    ...rmResource
  },
  {
    method: 'POST',
    path: '/api/v0/files/stat',
    ...statResource,
  },
  {
    method: 'POST',
    path: '/api/v0/files/touch',
    ...touchResource
  },
  {
    method: 'POST',
    path: '/api/v0/files/write',
    ...writeResource
  }
]
