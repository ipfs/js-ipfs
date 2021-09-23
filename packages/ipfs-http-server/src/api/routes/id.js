import {
  idResource
} from '../resources/id.js'

export default [{
  method: 'POST',
  path: '/api/v0/id',
  ...idResource
}]
