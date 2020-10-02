'use strict'

const toUri = require('multiaddr-to-uri')
const debug = require('debug')
const CID = require('cids')
const shuffle = require('array-shuffle')
const AbortController = require('abort-controller').default
const preload = require('./runtime/preload-nodejs')

const log = Object.assign(
  debug('ipfs:preload'),
  { error: debug('ipfs:preload:error') }
)

module.exports = options => {
  options = options || {}
  options.enabled = Boolean(options.enabled)
  options.addresses = options.addresses || []

  if (!options.enabled || !options.addresses.length) {
    log('preload disabled')
    const api = () => {}
    return Object.assign(api, {
      start: () => {},
      stop: () => {}
    })
  }

  let stopped = true
  let requests = []
  const apiUris = options.addresses.map(toUri)

  const api = async path => {
    try {
      if (stopped) throw new Error(`preload ${path} but preloader is not started`)

      if (typeof path !== 'string') {
        path = new CID(path).toString()
      }

      const fallbackApiUris = shuffle(apiUris)
      let success = false
      const now = Date.now()

      for (const uri of fallbackApiUris) {
        if (stopped) throw new Error(`preload aborted for ${path}`)
        let controller

        try {
          controller = new AbortController()
          requests = requests.concat(controller)
          await preload(`${uri}/api/v0/refs?r=true&arg=${encodeURIComponent(path)}`, { signal: controller.signal })
          success = true
        } catch (err) {
          if (err.type !== 'aborted') log.error(err)
        } finally {
          requests = requests.filter(r => r !== controller)
        }

        if (success) break
      }

      log(`${success ? '' : 'un'}successfully preloaded ${path} in ${Date.now() - now}ms`)
    } catch (err) {
      log.error(err)
    }
  }

  api.start = () => {
    stopped = false
  }

  api.stop = () => {
    stopped = true
    log(`aborting ${requests.length} pending preload request(s)`)
    requests.forEach(r => r.abort())
    requests = []
  }

  return api
}
