import { versionResource } from '../resources/version.js'

export default [{
  method: 'POST',
  path: '/api/v0/version',
  ...versionResource
}]
