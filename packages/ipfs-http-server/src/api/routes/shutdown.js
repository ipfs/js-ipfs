import {
  shutdownResource
} from '../resources/shutdown.js'

export default [{
  method: 'POST',
  path: '/api/v0/shutdown',
  ...shutdownResource
}]
