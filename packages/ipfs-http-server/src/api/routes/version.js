
import { versionResource } from '../resources/index.js'

export default [{
  method: 'POST',
  path: '/api/v0/version',
  ...versionResource
}]
