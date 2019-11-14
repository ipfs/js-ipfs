'use strict'

const nodeify = require('promise-nodeify')
const callbackify = require('callbackify')
const all = require('async-iterator-all')
const { concatify, collectify, pullify, streamify } = require('../lib/converters')
const toPullStream = require('async-iterator-to-pull-stream')
const pull = require('pull-stream/pull')
const map = require('pull-stream/throughs/map')

function requireCommands (send, config) {
  const add = require('../add')(config)
  const addFromFs = require('../add-from-fs')(config)
  const addFromURL = require('../add-from-url')(config)
  const cat = require('../cat')(config)
  const get = require('../get')(config)
  const ls = require('../ls')(config)
  const refs = require('../refs')(config)

  const cmds = {
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
    cat: callbackify.variadic((path, options) => concatify(cat)(path, options)),
    catReadableStream: streamify.readable(cat),
    catPullStream: pullify.source(cat),
    _catAsyncIterator: cat,
    get: callbackify.variadic(async (path, options) => {
      const output = []

      for await (const entry of get(path, options)) {
        if (entry.content) {
          entry.content = Buffer.concat(await all(entry.content))
        }

        output.push(entry)
      }

      return output
    }),
    getReadableStream: streamify.readable(get),
    getPullStream: (path, options) => {
      return pull(
        toPullStream(get(path, options)),
        map(file => {
          if (file.content) {
            file.content = toPullStream(file.content)
          }

          return file
        })
      )
    },
    _getAsyncIterator: get,
    ls: callbackify.variadic((path, options) => collectify(ls)(path, options)),
    lsReadableStream: streamify.readable(ls),
    lsPullStream: pullify.source(ls),
    _lsAsyncIterator: ls,
    refs: callbackify.variadic((path, options) => collectify(refs)(path, options)),
    refsReadableStream: streamify.readable(refs),
    refsPullStream: pullify.source(refs),
    _refsAsyncIterator: refs,
    getEndpointConfig: require('../get-endpoint-config')(config),
    bitswap: require('../bitswap')(config),
    block: require('../block')(config),
    bootstrap: require('../bootstrap')(config),
    config: require('../config')(config),
    dag: require('../dag')(config),
    dht: require('../dht')(config)
  }

  Object.assign(cmds.refs, {
    local: callbackify.variadic(options => collectify(refs.local)(options)),
    localReadableStream: streamify.readable(refs.local),
    localPullStream: pullify.source(refs.local),
    _localAsyncIterator: refs.local
  })

  const subCmds = {
    // Files MFS (Mutable Filesystem)
    files: require('../files'),

    // Graph
    object: require('../object'),
    pin: require('../pin'),

    // Network
    name: require('../name'),
    ping: require('../ping'),
    pingReadableStream: require('../ping-readable-stream'),
    pingPullStream: require('../ping-pull-stream'),
    swarm: require('../swarm'),
    pubsub: require('../pubsub'),
    dns: require('../dns'),

    // Miscellaneous
    commands: require('../commands'),
    diag: require('../diag'),
    id: require('../id'),
    key: require('../key'),
    log: require('../log'),
    mount: require('../mount'),
    repo: require('../repo'),
    stop: require('../stop'),
    shutdown: require('../stop'),
    stats: require('../stats'),
    update: require('../update'),
    version: require('../version'),
    resolve: require('../resolve')
  }

  Object.keys(subCmds).forEach((file) => {
    cmds[file] = subCmds[file](send, config)
  })

  return cmds
}

module.exports = requireCommands
