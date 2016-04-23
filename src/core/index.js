'use strict'

const defaultRepo = require('./default-repo')
const blocks = require('ipfs-blocks')
const BlockService = blocks.BlockService
const Block = blocks.Block
const mDAG = require('ipfs-merkle-dag')
const DAGNode = mDAG.DAGNode
const DAGService = mDAG.DAGService
const peerId = require('peer-id')
const PeerInfo = require('peer-info')
const multiaddr = require('multiaddr')
const importer = require('ipfs-unixfs-engine').importer
const exporter = require('ipfs-unixfs-engine').exporter
const libp2p = require('libp2p-ipfs')
const init = require('./init')
const IPFSRepo = require('ipfs-repo')
const UnixFS = require('ipfs-unixfs')

exports = module.exports = IPFS

function IPFS (repo) {
  if (!(this instanceof IPFS)) {
    throw new Error('Must be instantiated with new')
  }

  if (!(repo instanceof IPFSRepo)) {
    repo = defaultRepo(repo)
  }

  const blockS = new BlockService(repo)
  const dagS = new DAGService(blockS)
  var peerInfo
  var libp2pNode
  var peerInfoBook = {}

  this.load = (callback) => {
    repo.exists((err, exists) => {
      if (err) {
        throw err
      }

      repo.config.get((err, config) => {
        if (err) {
          throw err
        }
        const pid = peerId.createFromPrivKey(config.Identity.PrivKey)
        peerInfo = new PeerInfo(pid)
        config.Addresses.Swarm.forEach((addr) => {
          peerInfo.multiaddr.add(multiaddr(addr))
        })
        callback()
      })
    })
  }

  this.version = (opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    repo.exists((err, exists) => {
      if (err) { return callback(err) }

      repo.config.get((err, config) => {
        if (err) { return callback(err) }

        callback(null, config.Version.Current)
      })
    })
  }

  this.id = (opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }
    if (!peerInfo) { // because of split second warmup
      setTimeout(ready, 100)
    } else {
      ready()
    }
    function ready () {
      callback(null, {
        ID: peerInfo.id.toB58String(),
        PublicKey: peerInfo.id.pubKey.toString('base64'),
        Addresses: peerInfo.multiaddrs.map((ma) => { return ma.toString() }),
        AgentVersion: 'js-ipfs',
        ProtocolVersion: '9000'
      })
    }
  }

  this.repo = {
    init: (bits, empty, callback) => {
      // 1. check if repo already exists
    },

    version: (opts, callback) => {
      if (typeof opts === 'function') {
        callback = opts
        opts = {}
      }
      repo.exists((err, res) => {
        if (err) { return callback(err) }
        repo.version.get(callback)
      })
    },

    gc: function () {},

    path: () => repo.path
  }

  this.init = (opts, callback) => { init(repo, opts, callback) }

  this.bootstrap = {
    list: (callback) => {
      repo.config.get((err, config) => {
        if (err) { return callback(err) }
        callback(null, config.Bootstrap)
      })
    },
    add: (multiaddr, callback) => {
      repo.config.get((err, config) => {
        if (err) { return callback(err) }
        config.Bootstrap.push(multiaddr)
        repo.config.set(config, (err) => {
          if (err) { return callback(err) }

          callback()
        })
      })
    },
    rm: (multiaddr, callback) => {
      repo.config.get((err, config) => {
        if (err) { return callback(err) }
        config.Bootstrap = config.Bootstrap.filter((mh) => {
          if (mh === multiaddr) {
            return false
          } else { return true }
        })
        repo.config.set(config, (err) => {
          if (err) { return callback(err) }
          callback()
        })
      })
    }
  }

  this.config = {
    // cli only feature built with show and replace
    // edit: (callback) => {},
    replace: (config, callback) => {
      repo.config.set(config, callback)
    },
    show: (callback) => {
      repo.config.get((err, config) => {
        if (err) { return callback(err) }
        callback(null, config)
      })
    }
  }

  this.block = {
    get: (multihash, callback) => {
      blockS.getBlock(multihash, callback)
    },
    put: (block, callback) => {
      blockS.addBlock(block, callback)
    },
    del: (multihash, callback) => {
      blockS.deleteBlock(multihash, callback)
    },
    stat: (multihash, callback) => {
      blockS.getBlock(multihash, (err, block) => {
        if (err) {
          return callback(err)
        }
        callback(null, {
          Key: multihash,
          Size: block.data.length
        })
      })
    }
  }

  this.object = {
    new: (template, callback) => {
      if (!callback) {
        callback = template
      }
      var node = new DAGNode()
      var block = new Block(node.marshal())
      blockS.addBlock(block, function (err) {
        if (err) {
          return callback(err)
        }
        callback(null, {
          Hash: block.key,
          Size: node.size(),
          Name: ''
        })
      })
    },
    patch: {
      appendData: (multihash, data, callback) => {
        this.object.get(multihash, (err, obj) => {
          if (err) { return callback(err) }
          obj.data = Buffer.concat([obj.data, data])
          dagS.add(obj, (err) => {
            if (err) {
              return callback(err)
            }
            callback(null, obj)
          })
        })
      },
      addLink: (multihash, link, callback) => {
        this.object.get(multihash, (err, obj) => {
          if (err) { return callback(err) }
          obj.addRawLink(link)
          dagS.add(obj, (err) => {
            if (err) {
              return callback(err)
            }
            callback(null, obj)
          })
        })
      },
      rmLink: (multihash, linkRef, callback) => {
        this.object.get(multihash, (err, obj) => {
          if (err) { return callback(err) }
          obj.links = obj.links.filter((link) => {
            // filter by name when linkRef is a string, or by hash otherwise
            if (typeof linkRef === 'string') {
              return link.name !== linkRef
            }
            return !link.hash.equals(linkRef)
          })
          dagS.add(obj, (err) => {
            if (err) {
              return callback(err)
            }
            callback(null, obj)
          })
        })
      },
      setData: (multihash, data, callback) => {
        this.object.get(multihash, (err, obj) => {
          if (err) { return callback(err) }
          obj.data = data
          dagS.add(obj, (err) => {
            if (err) {
              return callback(err)
            }
            callback(null, obj)
          })
        })
      }
    },
    data: (multihash, callback) => {
      this.object.get(multihash, (err, obj) => {
        if (err) {
          return callback(err)
        }
        callback(null, obj.data)
      })
    },
    links: (multihash, callback) => {
      this.object.get(multihash, (err, obj) => {
        if (err) {
          return callback(err)
        }
        callback(null, obj.links)
      })
    },
    get: (multihash, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      dagS.get(multihash, callback)
    },
    put: (dagNode, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      dagS.add(dagNode, callback)
    },
    stat: (multihash, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      this.object.get(multihash, (err, obj) => {
        if (err) {
          return callback(err)
        }
        var res = {
          NumLinks: obj.links.length,
          BlockSize: obj.marshal().length,
          LinksSize: obj.links.reduce((prev, link) => {
            return prev + link.size
          }, 0),
          DataSize: obj.data.length,
          CumulativeSize: ''
        }
        callback(null, res)
      })
    }
  }

  const OFFLINE_ERROR = new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')

  this.libp2p = {
    start: (callback) => {
      libp2pNode = new libp2p.Node(peerInfo)
      libp2pNode.start(() => {
        // TODO connect to bootstrap nodes, it will get us more addrs
        peerInfo.multiaddrs.forEach((ma) => {
          console.log('Swarm listening on', ma.toString())
        })
        callback()
      })
    },
    stop: (callback) => {
      libp2pNode.swarm.close(callback)
    },
    swarm: {
      peers: (callback) => {
        if (!libp2pNode) {
          return callback(OFFLINE_ERROR)
        }

        callback(null, peerInfoBook)
      },
      // all the addrs we know
      addrs: (callback) => {
        if (!libp2pNode) {
          return callback(OFFLINE_ERROR)
        }
        // TODO
        notImpl()
      },
      localAddrs: (callback) => {
        if (!libp2pNode) {
          return callback(OFFLINE_ERROR)
        }

        callback(null, peerInfo.multiaddrs)
      },
      connect: (ma, callback) => {
        if (!libp2pNode) {
          return callback(OFFLINE_ERROR)
        }

        const idStr = ma.toString().match(/\/ipfs\/(.*)/)
        if (!idStr) {
          return callback(new Error('invalid multiaddr'))
        }
        const id = peerId.createFromB58String(idStr[1])
        const peer = new PeerInfo(id)

        ma = ma.toString().replace(/\/ipfs\/(.*)/, '') // FIXME remove this when multiaddr supports ipfs

        peer.multiaddr.add(multiaddr(ma))
        peerInfoBook[peer.id.toB58String()] = peer

        libp2pNode.swarm.dial(peer, (err) => {
          callback(err, id)
        })
      },
      disconnect: (callback) => {
        if (!libp2pNode) {
          return callback(OFFLINE_ERROR)
        }

        notImpl()
      },
      filters: notImpl // TODO
    },
    routing: {},
    records: {},
    ping: notImpl
  }

  this.files = {
    add: (path, options, callback) => {
      options.path = path
      options.dagService = dagS
      options.recursive = options

      importer.import(path, options.dagService, options, function (err, stat) {
        if (err) {
          callback(err, null)
        }
        callback(null, stat)
      })
    },
    cat: (hash, callback) => {
      dagS.get(hash, (err, fetchedNode) => {
        if (err) {
          return callback(err, null)
        }
        const data = UnixFS.unmarshal(fetchedNode.data)
        if (data.type === 'directory') {
          callback('This dag node is a directory', null)
        } else {
          const exportEvent = exporter(hash, dagS)
          callback(null, exportEvent)
        }
      })
    },
    get: (hash, callback) => {
      var exportFile = exporter(hash, dagS)
      callback(null, exportFile)
    }
  }
}

function notImpl () {
  throw new Error('Not implemented yet')
}
