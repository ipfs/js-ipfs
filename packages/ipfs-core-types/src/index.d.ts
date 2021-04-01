import { API as RootAPI } from './root'
import { API as BitswapAPI } from './bitswap'
import { API as BlockAPI } from './block'
import { API as BootstrapAPI } from './bootstrap'
import { API as ConfigAPI } from './config'
import { API as DAGAPI } from './dag'
import { API as DHTAPI } from './dht'
import { API as DiagAPI } from './diag'
import { API as FilesAPI } from './files'
import { API as KeyAPI } from './key'
import { API as LogAPI } from './log'
import { API as NameAPI } from './name'
import { API as ObjectAPI } from './object'
import { API as PinAPI } from './pin'
import { API as PubsubAPI } from './pubsub'
import { Refs, Local } from './refs'
import { API as RepoAPI } from './repo'
import { API as StatsAPI } from './stats'
import { API as SwarmAPI } from './swarm'
import { AbortOptions, Await, AwaitIterable } from './utils'

interface RefsAPI extends Refs {
  local: Local
}

export interface IPFS extends RootAPI {
  bitswap: BitswapAPI
  block: BlockAPI
  bootstrap: BootstrapAPI
  config: ConfigAPI
  dag: DAGAPI
  dht: DHTAPI
  diag: DiagAPI
  files: FilesAPI
  key: KeyAPI
  log: LogAPI
  name: NameAPI
  object: ObjectAPI
  pin: PinAPI
  pubsub: PubsubAPI
  refs: RefsAPI
  repo: RepoAPI
  stats: StatsAPI
  swarm: SwarmAPI
}

export type {
  AbortOptions,
  Await,
  AwaitIterable
}
