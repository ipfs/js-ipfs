import {
  dnsResource
} from '../resources/dns.js'

export default [{
  method: 'POST',
  path: '/api/v0/dns',
  ...dnsResource
}]
