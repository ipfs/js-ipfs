import HTTP from 'ipfs-utils/src/http.js'
import debug from 'debug'
import drain from 'it-drain'

const log = Object.assign(debug('ipfs:preload'), {
  error: debug('ipfs:preload:error')
})

/**
 * @param {string} url
 * @param {import('ipfs-core-types/src/utils').AbortOptions} options
 */
export async function preload (url, options = {}) {
  log(url)

  const res = await HTTP.post(url, { signal: options.signal })

  if (res.body) {
    // Read to completion but do not cache
    // @ts-ignore
    await drain(res.body)
  }
}
