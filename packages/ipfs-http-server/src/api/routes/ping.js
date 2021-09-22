import {
  pingResource
} from '../resources/ping.js'

export default [{
  method: 'POST',
  path: '/api/v0/ping',
  ...pingResource
}]
