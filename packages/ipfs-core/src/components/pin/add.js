import last from 'it-last'
import { CID } from 'multiformats/cid'

/**
 * @param {object} config
 * @param {ReturnType<typeof import('./add-all').createAddAll>} config.addAll
 */
export function createAdd ({ addAll }) {
  /**
   * @type {import('ipfs-core-types/src/pin').API<{}>["add"]}
   */
  return (path, options = {}) => {
    let iter

    const cid = CID.asCID(path)

    if (cid) {
      iter = addAll([{
        cid,
        ...options
      }], options)
    } else {
      iter = addAll([{
        path: path.toString(),
        ...options
      }], options)
    }

    // @ts-expect-error return value of last can be undefined
    return last(iter)
  }
}
