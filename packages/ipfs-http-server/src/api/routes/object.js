import {
  newResource,
  getResource,
  putResource,
  statResource,
  dataResource,
  linksResource,
  patchAppendDataResource,
  patchSetDataResource,
  patchAddLinkResource,
  patchRmLinkResource
} from '../resources/object.js'

export default [
  {
    method: 'POST',
    path: '/api/v0/object/new',
    ...newResource
  },
  {
    method: 'POST',
    path: '/api/v0/object/get',
    ...getResource
  },
  {
    method: 'POST',
    path: '/api/v0/object/put',
    ...putResource
  },
  {
    method: 'POST',
    path: '/api/v0/object/stat',
    ...statResource
  },
  {
    method: 'POST',
    path: '/api/v0/object/data',
    ...dataResource
  },
  {
    method: 'POST',
    path: '/api/v0/object/links',
    ...linksResource
  },
  {
    method: 'POST',
    path: '/api/v0/object/patch/append-data',
    ...patchAppendDataResource
  },
  {
    method: 'POST',
    path: '/api/v0/object/patch/set-data',
    ...patchSetDataResource
  },
  {
    method: 'POST',
    path: '/api/v0/object/patch/add-link',
    ...patchAddLinkResource
  },
  {
    method: 'POST',
    path: '/api/v0/object/patch/rm-link',
    ...patchRmLinkResource
  }
]
