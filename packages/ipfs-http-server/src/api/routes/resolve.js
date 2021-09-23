import {
  resolveResource
} from '../resources/resolve.js'

export default [{
  method: 'POST',
  path: '/api/v0/resolve',
  ...resolveResource
}]
