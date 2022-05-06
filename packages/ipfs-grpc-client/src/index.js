import { toUrlString } from 'ipfs-core-utils/to-url-string'
import { loadServices } from './utils/load-services.js'
import grpcWeb from '@improbable-eng/grpc-web'
import { grpcAddAll } from './core-api/add-all.js'
import { grpcId } from './core-api/id.js'
import { grpcMfsLs } from './core-api/files/ls.js'
import { grpcMfsWrite } from './core-api/files/write.js'
import { grpcPubsubSubscribe } from './core-api/pubsub/subscribe.js'
import { grpcPubsubUnsubscribe } from './core-api/pubsub/unsubscribe.js'

/**
 * @typedef {import('./types').Options} Options
 */

const service = loadServices()

/** @type {Record<string, string>} */
const protocols = {
  'ws://': 'http://',
  'wss://': 'https://'
}

/**
 * @param {{ url: string }} opts
 */
function normaliseUrls (opts) {
  Object.keys(protocols).forEach(protocol => {
    if (opts.url.startsWith(protocol)) {
      opts.url = protocols[protocol] + opts.url.substring(protocol.length)
    }
  })
}

/**
 * @param {Options} [opts]
 */
export function create (opts = { url: '' }) {
  const options = {
    ...opts,
    url: toUrlString(opts.url)
  }

  // @improbable-eng/grpc-web requires http:// protocol URLs, not ws://
  normaliseUrls(options)

  const client = {
    addAll: grpcAddAll(grpcWeb.grpc, service.Root.add, options),
    id: grpcId(grpcWeb.grpc, service.Root.id, options),
    files: {
      ls: grpcMfsLs(grpcWeb.grpc, service.MFS.ls, options),
      write: grpcMfsWrite(grpcWeb.grpc, service.MFS.write, options)
    },
    pubsub: {
      subscribe: grpcPubsubSubscribe(grpcWeb.grpc, service.PubSub.subscribe, options),
      unsubscribe: grpcPubsubUnsubscribe(grpcWeb.grpc, service.PubSub.unsubscribe, options)
    }
  }

  return client
}
