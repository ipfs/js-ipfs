import add from './add.js'
import bitswap from './bitswap.js'
import block from './block.js'
import bootstrap from './bootstrap.js'
import cat from './cat.js'
import cid from './cid.js'
import config from './config.js'
import daemon from './daemon.js'
import dag from './dag.js'
import dht from './dht.js'
import dns from './dns.js'
import files from './files.js'
import get from './get.js'
import id from './id.js'
import init from './init.js'
import key from './key.js'
import ls from './ls.js'
import name from './name.js'
import object from './object.js'
import pin from './pin.js'
import ping from './ping.js'
import pubsub from './pubsub.js'
import refsLocal from './refs-local.js'
import refs from './refs.js'
import repo from './repo.js'
import resolve from './resolve.js'
import shutdown from './shutdown.js'
import stats from './stats.js'
import swarm from './swarm.js'
import version from './version.js'

/** @type {import('yargs').CommandModule[]} */
export const commandList = [
  add,
  bitswap,
  block,
  bootstrap,
  cat,
  cid,
  config,
  daemon,
  dag,
  dht,
  dns,
  files,
  get,
  id,
  init,
  key,
  ls,
  name,
  object,
  pin,
  ping,
  pubsub,
  refsLocal,
  refs,
  repo,
  resolve,
  shutdown,
  stats,
  swarm,
  version
]
