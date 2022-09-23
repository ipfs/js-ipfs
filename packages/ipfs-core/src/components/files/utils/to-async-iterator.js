import errCode from 'err-code'
import { logger } from '@libp2p/logger'
import {
  MFS_MAX_CHUNK_SIZE
} from '../../../utils.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

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

    let index = 0

    const iterator = {
      next: () => {
        if (index > content.size) {
          return {
            done: true
          }
        }

        return new Promise((resolve, reject) => {
          const chunk = content.slice(index, MFS_MAX_CHUNK_SIZE)
          index += MFS_MAX_CHUNK_SIZE

          const reader = new global.FileReader()

          /**
           * @param {{ error?: Error }} ev
           */
          const handleLoad = (ev) => {
            // @ts-expect-error No overload matches this call.
            reader.removeEventListener('loadend', handleLoad, false)

            if (ev.error) {
              return reject(ev.error)
            }

            resolve({
              done: false,
              value: new Uint8Array(/** @type {ArrayBuffer} */(reader.result))
            })
          }

          // @ts-expect-error No overload matches this call.
          reader.addEventListener('loadend', handleLoad)
          reader.readAsArrayBuffer(chunk)
        })
      }
    }

    return {
      [Symbol.asyncIterator]: () => {
        return iterator
      }
    }
  }

  throw errCode(new Error(`Don't know how to convert ${content} into an async iterator`), 'ERR_INVALID_PARAMS')
}
