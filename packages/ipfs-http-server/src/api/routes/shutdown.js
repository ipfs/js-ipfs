import {
  shutdownResource
} from '../resources/shutdown'

export default [{
  method: 'POST',
  path: '/api/v0/shutdown',
  ...shutdownResource
}]
