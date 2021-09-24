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
    // @ts-ignore - TODO: fix after https://github.com/ipfs/js-ipfs/issues/3594
    addAll: grpcAddAll(grpcWeb.grpc, service.Root.add, options),
    // @ts-ignore - TODO: fix after https://github.com/ipfs/js-ipfs/issues/3594
    id: grpcId(grpcWeb.grpc, service.Root.id, options),
    files: {
      // @ts-ignore - TODO: fix after https://github.com/ipfs/js-ipfs/issues/3594
      ls: grpcMfsLs(grpcWeb.grpc, service.MFS.ls, options),
      // @ts-ignore - TODO: fix after https://github.com/ipfs/js-ipfs/issues/3594
      write: grpcMfsWrite(grpcWeb.grpc, service.MFS.write, options)
    },
    pubsub: {
      // @ts-ignore - TODO: fix after https://github.com/ipfs/js-ipfs/issues/3594
      subscribe: grpcPubsubSubscribe(grpcWeb.grpc, service.PubSub.subscribe, options),
      // @ts-ignore - TODO: fix after https://github.com/ipfs/js-ipfs/issues/3594
      unsubscribe: grpcPubsubUnsubscribe(grpcWeb.grpc, service.PubSub.unsubscribe, options)
    }
  }

  return client
}
