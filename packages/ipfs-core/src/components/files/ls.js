import { exporter } from 'ipfs-unixfs-exporter'
import { toMfsPath } from './utils/to-mfs-path.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import map from 'it-map'

/**
 * @typedef {import('./').MfsContext} MfsContext
 * @typedef {import('ipfs-core-types/src/files').MFSEntry} MFSEntry
 */

/**
 * @param {import('ipfs-unixfs-exporter').UnixFSEntry} fsEntry
 */
const toOutput = (fsEntry) => {
  /** @type {MFSEntry} */
  const output = {
    cid: fsEntry.cid,
    name: fsEntry.name,
    type: fsEntry.type === 'directory' ? 'directory' : 'file',
    size: fsEntry.size
  }

  if (fsEntry.type === 'file' || fsEntry.type === 'directory') {
    output.mode = fsEntry.unixfs.mode
    output.mtime = fsEntry.unixfs.mtime
  }

  return output
}

/**
 * @param {MfsContext} context
 */
export function createLs (context) {
  /**
   * @type {import('ipfs-core-types/src/files').API<{}>["ls"]}
   */
  async function * mfsLs (path, options = {}) {
    const mfsPath = await toMfsPath(context, path, options)
    const fsEntry = await exporter(mfsPath.mfsPath, context.repo.blocks)

    // directory, perhaps sharded
    if (fsEntry.type === 'directory') {
      yield * map(fsEntry.content(options), toOutput)

      return
    }

    // single file/node
    yield toOutput(fsEntry)
  }

  return withTimeoutOption(mfsLs)
}
