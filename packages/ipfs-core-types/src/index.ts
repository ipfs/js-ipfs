import type { API as RootAPI } from './root'
import type { API as BitswapAPI } from './bitswap'
import type { API as BlockAPI } from './block'
import type { API as BootstrapAPI } from './bootstrap'
import type { API as ConfigAPI } from './config'
import type { API as DAGAPI } from './dag'
import type { API as DHTAPI } from './dht'
import type { API as DiagAPI } from './diag'
import type { API as FilesAPI } from './files'
import type { API as KeyAPI } from './key'
import type { API as LogAPI } from './log'
import type { API as NameAPI } from './name'
import type { API as ObjectAPI } from './object'
import type { API as PinAPI } from './pin'
import type { API as PubsubAPI } from './pubsub'
import type { Refs, Local } from './refs'
import type { API as RepoAPI } from './repo'
import type { API as StatsAPI } from './stats'
import type { API as SwarmAPI } from './swarm'
import type { AbortOptions, Await, AwaitIterable } from './utils'
import type { BlockCodec } from 'multiformats/codecs/interface'
import type { MultibaseCodec } from 'multiformats/bases/interface'
import type { MultihashHasher } from 'multiformats/hashes/interface'

interface RefsAPI<OptionExtension = {}> extends Refs<OptionExtension> {
  local: Local<OptionExtension>
}

export interface IPFS<OptionExtension = {}> extends RootAPI<OptionExtension> {
  bitswap: BitswapAPI<OptionExtension>
  block: BlockAPI<OptionExtension>
  bootstrap: BootstrapAPI<OptionExtension>
  config: ConfigAPI<OptionExtension>
  dag: DAGAPI<OptionExtension>
  dht: DHTAPI<OptionExtension>
  diag: DiagAPI<OptionExtension>
  files: FilesAPI<OptionExtension>
  key: KeyAPI<OptionExtension>
  log: LogAPI<OptionExtension>
  name: NameAPI<OptionExtension>
  object: ObjectAPI<OptionExtension>
  pin: PinAPI<OptionExtension>
  pubsub: PubsubAPI<OptionExtension>
  refs: RefsAPI<OptionExtension>
  repo: RepoAPI<OptionExtension>
  stats: StatsAPI<OptionExtension>
  swarm: SwarmAPI<OptionExtension>
  bases: Bases
  codecs: Codecs
  hashers: Hashers
}

interface Bases {
  getBase: (code: string) => Promise<MultibaseCodec<any>>
  listBases: () => Array<MultibaseCodec<any>>
}

interface Codecs {
  getCodec: (code: number | string) => Promise<BlockCodec<any, any>>
  listCodecs: () => Array<BlockCodec<any, any>>
}

interface Hashers {
  getHasher: (code: number | string) => Promise<MultihashHasher>
  listHashers: () => MultihashHasher[]
}

export type {
  AbortOptions,
  Await,
  AwaitIterable
}
