import { isElectronRenderer } from 'ipfs-utils/src/env.js'
import { multipartRequest as multipartRequestNode } from './multipart-request.node.js'
import { multipartRequest as multipartRequestBrowser } from './multipart-request.browser.js'
import { nanoid } from 'nanoid'

/**
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidateStream} ImportCandidateStream
 */

/**
 * @param {ImportCandidateStream} source
 * @param {AbortController} abortController
 * @param {Headers|Record<string, string>} [headers]
 * @param {string} [boundary]
 */
export async function multipartRequest (source, abortController, headers = {}, boundary = `-----------------------------${nanoid()}`) {
  let req = multipartRequestNode

  // In electron-renderer we use native fetch and should encode body using native
  // form data.
  if (isElectronRenderer) {
    // @ts-expect-error types are different
    req = multipartRequestBrowser
  }

  return req(source, abortController, headers, boundary)
}
