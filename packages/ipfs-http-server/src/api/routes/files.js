import { chmodResource } from '../resources/files/chmod.js'
import { cpResource } from '../resources/files/cp.js'
import { flushResource } from '../resources/files/flush.js'
import { lsResource } from '../resources/files/ls.js'
import { mkdirResource } from '../resources/files/mkdir.js'
import { mvResource } from '../resources/files/mv.js'
import { readResource } from '../resources/files/read.js'
import { rmResource } from '../resources/files/rm.js'
import { statResource } from '../resources/files/stat.js'
import { touchResource } from '../resources/files/touch.js'
import { writeResource } from '../resources/files/write.js'

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
    ...statResource
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
