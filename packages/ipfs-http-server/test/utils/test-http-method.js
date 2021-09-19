
import { expect } from 'aegir/utils/chai.js'
import { http } from './http.js'

const METHODS = [
  'GET',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD'
]

export async function testHttpMethod (url, ipfs) {
  for (let i = 0; i < METHODS.length; i++) {
    const res = await http({
      method: METHODS[i],
      url
    }, { ipfs })

    expect(res).to.have.property('statusCode', 405)
    expect(res).to.have.nested.property('headers.allow', 'OPTIONS, POST')
  }
}
