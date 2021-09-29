import { createSuite } from './utils/suite.js'
import { testAdd } from './add.js'
import { testAddAll } from './add-all.js'
import { testCat } from './cat.js'
import { testGet } from './get.js'
import { testLs } from './ls.js'
import { testRefs } from './refs.js'
import { testRefsLocal } from './refs-local.js'
import testFiles from './files/index.js'
import testBitswap from './bitswap/index.js'
import testBlock from './block/index.js'
import testDag from './dag/index.js'
import testObject from './object/index.js'
import testPin from './pin/index.js'
import testBootstrap from './bootstrap/index.js'
import testDht from './dht/index.js'
import testName from './name/index.js'
import testNamePubsub from './name-pubsub/index.js'
import testPing from './ping/index.js'
import testPubsub from './pubsub/index.js'
import testSwarm from './swarm/index.js'
import testConfig from './config/index.js'
import testKey from './key/index.js'
import testMiscellaneous from './miscellaneous/index.js'
import testRepo from './repo/index.js'
import testStats from './stats/index.js'

export const root = createSuite({
  add: testAdd,
  addAll: testAddAll,
  cat: testCat,
  get: testGet,
  ls: testLs,
  refs: testRefs,
  refsLocal: testRefsLocal
})

export const files = testFiles
export const bitswap = testBitswap
export const block = testBlock
export const dag = testDag
export const object = testObject
export const pin = testPin
export const bootstrap = testBootstrap
export const dht = testDht
export const name = testName
export const namePubsub = testNamePubsub
export const ping = testPing
export const pubsub = testPubsub
export const swarm = testSwarm
export const config = testConfig
export const key = testKey
export const miscellaneous = testMiscellaneous
export const repo = testRepo
export const stats = testStats
