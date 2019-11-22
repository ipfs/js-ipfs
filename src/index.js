'use strict'

const isIPFS = require('is-ipfs')
const { Buffer } = require('buffer')
const CID = require('cids')
const multiaddr = require('multiaddr')
const multibase = require('multibase')
const multicodec = require('multicodec')
const multihash = require('multihashes')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const nodeify = require('promise-nodeify')
const callbackify = require('callbackify')
const all = require('async-iterator-all')
const toPullStream = require('async-iterator-to-pull-stream')
const toStream = require('it-to-stream')
const BufferList = require('bl/BufferList')
const { concatify, collectify, pullify, streamify } = require('./lib/converters')

function ipfsClient (config) {
  const add = require('./add')(config)
  const addFromFs = require('./add-from-fs')(config)
  const addFromURL = require('./add-from-url')(config)
  const cat = require('./cat')(config)
  const get = require('./get')(config)
  const ls = require('./ls')(config)
  const ping = require('./ping')(config)
  const refs = require('./refs')(config)

  const api = {
    add: (input, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      return nodeify(collectify(add)(input, options), callback)
    },
    addReadableStream: streamify.transform(add),
    addPullStream: pullify.transform(add),
    addFromFs: (path, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      return nodeify(collectify(addFromFs)(path, options), callback)
    },
    addFromURL: (url, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      return nodeify(collectify(addFromURL)(url, options), callback)
    },
    addFromStream: (input, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      return nodeify(collectify(add)(input, options), callback)
    },
    _addAsyncIterator: add,
    bitswap: require('./bitswap')(config),
    block: require('./block')(config),
    bootstrap: require('./bootstrap')(config),
    cat: callbackify.variadic((path, options) => concatify(cat)(path, options)),
    catReadableStream: streamify.readable(cat),
    catPullStream: pullify.source(cat),
    _catAsyncIterator: cat,
    commands: callbackify.variadic(require('./commands')(config)),
    config: require('./config')(config),
    dag: require('./dag')(config),
    dht: require('./dht')(config),
    diag: require('./diag')(config),
    dns: callbackify.variadic(require('./dns')(config)),
    files: require('./files')(config),
    get: callbackify.variadic(async (path, options) => {
      const output = []

      for await (const entry of get(path, options)) {
        if (entry.content) {
          entry.content = new BufferList(await all(entry.content)).slice()
        }

        output.push(entry)
      }

      return output
    }),
    getEndpointConfig: require('./get-endpoint-config')(config),
    getReadableStream: streamify.readable(async function * (path, options) {
      for await (const file of get(path, options)) {
        if (file.content) {
          const { content } = file
          file.content = toStream((async function * () {
            for await (const chunk of content) {
              yield chunk.slice() // Convert bl to Buffer
            }
          })())
        }

        yield file
      }
    }),
    getPullStream: pullify.source(async function * (path, options) {
      for await (const file of get(path, options)) {
        if (file.content) {
          const { content } = file
          file.content = toPullStream((async function * () {
            for await (const chunk of content) {
              yield chunk.slice() // Convert bl to Buffer
            }
          })())
        }

        yield file
      }
    }),
    _getAsyncIterator: get,
    id: callbackify.variadic(require('./id')(config)),
    key: require('./key')(config),
    log: require('./log')(config),
    ls: callbackify.variadic((path, options) => collectify(ls)(path, options)),
    lsReadableStream: streamify.readable(ls),
    lsPullStream: pullify.source(ls),
    _lsAsyncIterator: ls,
    mount: callbackify.variadic(require('./mount')(config)),
    name: require('./name')(config),
    object: require('./object')(config),
    pin: require('./pin')(config),
    ping: callbackify.variadic(collectify(ping)),
    pingReadableStream: streamify.readable(ping),
    pingPullStream: pullify.source(ping),
    pubsub: require('./pubsub')(config),
    refs: callbackify.variadic((path, options) => collectify(refs)(path, options)),
    refsReadableStream: streamify.readable(refs),
    refsPullStream: pullify.source(refs),
    _refsAsyncIterator: refs,
    repo: require('./repo')(config),
    resolve: callbackify.variadic(require('./resolve')(config)),
    stats: require('./stats')(config),
    stop: callbackify.variadic(require('./stop')(config)),
    shutdown: callbackify.variadic(require('./stop')(config)),
    swarm: require('./swarm')(config),
    version: callbackify.variadic(require('./version')(config))
  }

  Object.assign(api.refs, {
    local: callbackify.variadic(options => collectify(refs.local)(options)),
    localReadableStream: streamify.readable(refs.local),
    localPullStream: pullify.source(refs.local),
    _localAsyncIterator: refs.local
  })

  return api
}

Object.assign(ipfsClient, { isIPFS, Buffer, CID, multiaddr, multibase, multicodec, multihash, PeerId, PeerInfo })

module.exports = ipfsClient
