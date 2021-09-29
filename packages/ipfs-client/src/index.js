import { create as httpClient } from 'ipfs-http-client'
import { create as grpcClient } from 'ipfs-grpc-client'
import mergeOpts from 'merge-options'

const mergeOptions = mergeOpts.bind({ ignoreUndefined: true })

/**
 * @typedef {import('ipfs-http-client').Options} HTTPOptions
 * @typedef {import('ipfs-grpc-client').Options} GRPCOptions
 * @typedef {string|URL|import('multiaddr').Multiaddr} Address
 * @typedef {{http?: Address, grpc?: Address} & Partial<HTTPOptions & GRPCOptions>} Options
 *
 * @param {Options} [opts]
 */
export function create (opts = {}) {
  const clients = []

  if (opts.http) {
    clients.push(httpClient({
      ...opts,
      url: opts.http
    }))
  }

  if (opts.grpc) {
    clients.push(grpcClient({
      ...opts,
      url: opts.grpc
    }))
  }

  // override http methods with grpc if address is supplied
  const out = mergeOptions({}, ...clients)

  return out
}
