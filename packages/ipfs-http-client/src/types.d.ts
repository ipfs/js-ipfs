import { Format as IPLDFormat } from 'interface-ipld-format'
import { Agent as HttpAgent } from 'http'
import { Agent as HttpsAgent } from 'https'
import { Multiaddr } from 'multiaddr'
import type { BlockCodec } from 'multiformats/codecs/interface'

export interface Options {
  host?: string
  port?: number
  protocol?: string
  headers?: Headers | Record<string, string>
  timeout?: number | string
  apiPath?: string
  url?: URL|string|Multiaddr
  ipld?: IPLDOptions
  agent?: HttpAgent | HttpsAgent
}

export type LoadBaseFn = (codeOrName: number | string) => Promise<MultibaseCodec<any>>
export type LoadCodecFn = (codeOrName: number | string) => Promise<BlockCodec<any, any>>
export type LoadHasherFn = (codeOrName: number | string) => Promise<MultihashHasher>

export interface IPLDOptions {
  loadBase: LoadBaseFn
  loadCodec: LoadCodecFn
  loadHasher: LoadHasherFn
  bases: MultibaseCodec<any>[]
  codecs: BlockCodec<any, any>[]
  hashers: MultihashHasher[]
}

export interface HTTPClientExtraOptions {
  headers?: Record<string, string>
  searchParams?: URLSearchParams
}

export interface EndpointConfig {
  host: string,
  port: string,
  protocol: string,
  pathname: string
  'api-path': string
}
