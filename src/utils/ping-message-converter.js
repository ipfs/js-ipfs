'use strict'

// Converts IPFS API ping messages to lowercase
//
// {
//  Success: true,
//  Text: 'foobar',
//  Time: 0
// }
//

module.exports = function pingMessageConverter (obj) {
  if (!isPingMessage(obj)) throw new Error('Invalid ping message received')
  return {
    success: obj.Success,
    time: obj.Time,
    text: obj.Text
  }
}

function isPingMessage (obj) {
  return obj && typeof obj.Success === 'boolean'
}
