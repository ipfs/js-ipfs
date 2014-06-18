#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var extend = require('xtend')
var mkdirp = require('mkdirp').sync
var untildify = require('untildify')
var leveldown = require('leveldown-prebuilt')
var argv = require('minimist')(process.argv.slice(2), {
  boolean: ['debug', 'r', 'recursive'],
})

var Peer = require('../ipfs-peer')
var Core = require('../ipfs-core')

var commands = {
  add: require('./add'),
  cat: require('./cat'),
  ls: require('./ls'),
}

var config = loadConfig(argv.config || '~/.ipfs/config')
config.dbpath = untildify(config.dbpath)

// proper ipfs config
var ipfsConfig = {
  identity: Peer(new Buffer(config.peerId, 'hex')),
  storage: {
    path: config.dbpath,
    levelup: { db: leveldown },
  },
}

// setup db
mkdirp(config.dbpath)

// initialize ipfs client
var ipfs = Core(ipfsConfig)

// run command
var cmd = argv._[0]
if (!cmd || !commands[cmd])
  usage(0)

argv._args = argv._.slice(1)
commands[cmd](ipfs, argv)


// functions

function usage(code) {
  console.log('ipfs [<flags>] <subcommand> [<args>]')
  console.log('')
  console.log('Subcommands:')
  console.log('')
  console.log('    cat <ipfs-path>  show the data for an ipfs object')
  console.log('    ls <ipfs-path>   show the children of an ipfs object')
  console.log('')
  console.log('Flags:')
  console.log('')
  console.log('    --config <file-path>   config file path. default: ~/.ipfsconfig')
  console.log('')
  process.exit(code)
}

function loadConfig(configFile) {
  configFile = untildify(configFile)

  var defaults = {
    dbpath: "~/.ipfs/db",
    peerId: Peer.genPeerId(configFile).toString('hex'),
  }

  if (!fs.existsSync(configFile)) {
    var contents = JSON.stringify(defaults, null, 2)
    mkdirp(path.dirname(configFile))
    fs.writeFileSync(configFile, contents)
  }

  try {
    var config = JSON.parse(fs.readFileSync(configFile))
  } catch (e) {
    console.error('ipfs cli: error parsing config: ' + configFile)
    console.error(e)
    process.exit(-1)
  }

  return extend(defaults, config)
}

