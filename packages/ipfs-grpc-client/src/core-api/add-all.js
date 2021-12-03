import { normaliseInput } from 'ipfs-core-utils/files/normalise-input-multiple'
import { CID } from 'multiformats/cid'
import { bidiToDuplex } from '../utils/bidi-to-duplex.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {number} index
 * @param {import('it-pushable').Pushable<any>} sink
 * @param {string} path
 * @param {number} [mode]
 * @param {import('ipfs-unixfs').Mtime} [mtime]
 */
function sendDirectory (index, sink, path, mode, mtime) {
  /**
   * TODO: type properly after https://github.com/ipfs/js-ipfs/issues/3594
   *
   * @type {Record<string, any>}
   */
  const message = {
    index,
    type: 'DIRECTORY',
    path
  }

  if (mtime) {
    message.mtime = mtime.secs
    message.mtimeNsecs = mtime.nsecs
  }

  if (mode != null) {
    message.mode = mode
  }

  sink.push(message)
}

/**
 * @param {number} index
 * @param {import('it-pushable').Pushable<any>} sink
 * @param {AsyncIterable<Uint8Array> | Iterable<Uint8Array> | Uint8Array} content
 * @param {string} [path]
 * @param {number} [mode]
 * @param {import('ipfs-unixfs').Mtime} [mtime]
 */
async function sendFile (index, sink, content, path, mode, mtime) {
  if (content instanceof Uint8Array) {
    content = [content]
  }

  for await (const buf of content) {
    /**
     * TODO: type properly after https://github.com/ipfs/js-ipfs/issues/3594
     *
     * @type {Record<string, any>}
     */
    const message = {
      index,
      type: 'FILE',
      path
    }

    if (mtime) {
      message.mtime = mtime.secs
      message.mtimeNsecs = mtime.nsecs
    }

    if (mode != null) {
      message.mode = mode
    }

    message.content = new Uint8Array(buf, buf.byteOffset, buf.byteLength)

    sink.push(message)
  }

  // signal that the file data has finished
  const message = {
    index,
    type: 'FILE',
    path
  }

  sink.push(message)
}

/**
 * @param {import('ipfs-core-types/src/utils').ImportCandidateStream} stream
 * @param {import('it-pushable').Pushable<any>} sink
 */
async function sendFiles (stream, sink) {
  let i = 1

  for await (const { path, content, mode, mtime } of normaliseInput(stream)) {
    const index = i
    i++

    if (content) {
      await sendFile(index, sink, content, path, mode, mtime)
    } else if (path) {
      sendDirectory(index, sink, path, mode, mtime)
    } else {
      throw new Error('Must pass path or content or both')
    }
  }
}

/**
 * @param {import('@improbable-eng/grpc-web').grpc} grpc
 * @param {*} service
 * @param {import('../types').Options} opts
 */
export function grpcAddAll (grpc, service, opts) {
  /**
   * @type {import('ipfs-core-types/src/root').API<{}>["addAll"]}
   */
  async function * addAll (stream, options = {}) {
    const {
      source,
      sink
    } = bidiToDuplex(grpc, service, {
      host: opts.url,
      debug: Boolean(process.env.DEBUG),
      metadata: options,
      agent: opts.agent
    })

    sendFiles(stream, sink)
      .catch(err => {
        sink.end(err)
      })
      .finally(() => {
        sink.end()
      })

    for await (const result of source) {
      // received progress result
      if (result.type === 'PROGRESS') {
        if (options.progress) {
          options.progress(result.bytes, result.path)
        }

        continue
      }

      // received file/dir import result
      yield {
        path: result.path,
        cid: CID.parse(result.cid),
        mode: result.mode,
        mtime: {
          secs: result.mtime || 0,
          nsecs: result.mtimeNsecs || 0
        },
        size: result.size
      }
    }
  }

  return withTimeoutOption(addAll)
}
