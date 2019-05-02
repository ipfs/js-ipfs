'use strict'

const kindOf = require('kind-of')
const isStream = require('is-stream')
const { isSource } = require('is-pull-stream')
const isBuffer = require('is-buffer')

const validateAddInput = (input) => {
  // Buffer|ReadableStream|PullStream|File
  const isPrimitive = obj => isBuffer(obj) || isStream.readable(obj) || isSource(obj) || kindOf(obj) === 'file'

  // An object like { content?, path? }, where content isBufferOrStream and path isString
  const isContentObject = obj => {
    if (typeof obj !== 'object') return false
    // path is optional if content is present
    if (obj.content) return isPrimitive(obj.content)
    // path must be a non-empty string if no content
    return Boolean(obj.path) && typeof obj.path === 'string'
  }

  // An input atom: a buffer, stream or content object
  const isInput = obj => isPrimitive(obj) || isContentObject(obj)

  if (isInput(input) || (Array.isArray(input) && input.every(isInput))) {
    return true
  } else {
    throw new Error(`Input not supported. Expected Buffer|ReadableStream|PullStream|File|Array<Object> got ${kindOf(input)}. Check the documentation for more info https://github.com/ipfs/interface-js-ipfs-core/blob/master/SPEC/FILES.md#add`)
  }
}

module.exports = validateAddInput
