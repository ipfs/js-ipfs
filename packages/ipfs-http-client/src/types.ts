import type { Agent as HttpAgent } from 'http'
import type { Agent as HttpsAgent } from 'https'
import type { Multiaddr } from 'multiaddr'
import type { BlockCodec } from 'multiformats/codecs/interface'
import type { MultihashHasher } from 'multiformats/hashes/interface'
import type { MultibaseCodec } from 'multiformats/bases/interface'
import type { IPFS } from 'ipfs-core-types'

export interface Options {
  host?: string
  port?: number
  protocol?: string
  headers?: Headers | Record<string, string>
  timeout?: number | string
  apiPath?: string
  url?: URL|string|Multiaddr
  ipld?: Partial<IPLDOptions>
  agent?: HttpAgent | HttpsAgent
}

export interface LoadBaseFn { (codeOrName: number | string): Promise<MultibaseCodec<any>> }
export interface LoadCodecFn { (codeOrName: number | string): Promise<BlockCodec<any, any>> }
export interface LoadHasherFn { (codeOrName: number | string): Promise<MultihashHasher> }

export interface IPLDOptions {
  loadBase: LoadBaseFn
  loadCodec: LoadCodecFn
  loadHasher: LoadHasherFn
  bases: Array<MultibaseCodec<any>>
  codecs: Array<BlockCodec<any, any>>
  hashers: MultihashHasher[]
}

export interface HTTPClientExtraOptions {
  headers?: Record<string, string>
  searchParams?: URLSearchParams
}

export interface EndpointConfig {
  host: string
  port: string
  protocol: string
  pathname: string
  'api-path': string
}

export interface IPFSHTTPClient extends IPFS<HTTPClientExtraOptions> {
  getEndpointConfig: () => EndpointConfig
}
