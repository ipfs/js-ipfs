import {
  getOrSetResource,
  showResource,
  replaceResource,
  profilesApplyResource,
  profilesListResource
} from '../resources/config.js'

export default [
  {
    method: 'POST',
    path: '/api/v0/config/{key?}',
    ...getOrSetResource
  },
  {
    method: 'POST',
    path: '/api/v0/config/show',
    ...showResource
  },
  {
    method: 'POST',
    path: '/api/v0/config/replace',
    ...replaceResource
  },
  {
    method: 'POST',
    path: '/api/v0/config/profile/apply',
    ...profilesApplyResource
  },
  {
    method: 'POST',
    path: '/api/v0/config/profile/list',
    ...profilesListResource
  }
]
