import dhtFindPeer from './find-peer.js'
import dhtFindProviders from './find-providers.js'
import dhtGet from './get.js'
import dhtProvide from './provide.js'
import dhtPut from './put.js'
import dhtQuery from './query.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  dhtFindPeer,
  dhtFindProviders,
  dhtGet,
  dhtProvide,
  dhtPut,
  dhtQuery
]
