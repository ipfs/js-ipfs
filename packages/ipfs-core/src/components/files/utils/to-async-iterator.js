import errCode from 'err-code'
import { logger } from '@libp2p/logger'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import browserStreamToIt from 'browser-readablestream-to-it'

const log = logger('ipfs:mfs:utils:to-async-iterator')

/**
 * @param {*} content
 */
export function toAsyncIterator (content) {
  if (!content) {
    throw errCode(new Error('paths must start with a leading slash'), 'ERR_INVALID_PATH')
  }

  if (typeof content === 'string' || content instanceof String) {
    log('Content was a string')

    content = uint8ArrayFromString(content.toString())
  }

  if (content.length) {
    log('Content was array-like')

    return {
      [Symbol.asyncIterator]: function * bufferContent () {
        yield content
      }
    }
  }

  if (content[Symbol.asyncIterator]) {
    log('Content was an async iterator')
    return content
  }

  if (content[Symbol.iterator]) {
    log('Content was an iterator')
    return content
  }

  if (global.Blob && content instanceof global.Blob) {
    // HTML5 Blob objects (including Files)
    log('Content was an HTML5 Blob')
    return browserStreamToIt(content.stream())
  }

  throw errCode(new Error(`Don't know how to convert ${content} into an async iterator`), 'ERR_INVALID_PARAMS')
}
