
import { expect } from 'aegir/utils/chai.js'

/**
 * @param {*} obj
 */
export function expectIsPingResponse (obj) {
  expect(obj).to.have.a.property('success')
  expect(obj).to.have.a.property('time')
  expect(obj).to.have.a.property('text')
  expect(obj.success).to.be.a('boolean')
  expect(obj.time).to.be.a('number')
  expect(obj.text).to.be.a('string')
}

/**
 * Determine if a ping response object is a pong, or something else, like a status message
 *
 * @param {*} pingResponse
 */
export function isPong (pingResponse) {
  return Boolean(pingResponse && pingResponse.success && !pingResponse.text)
}
