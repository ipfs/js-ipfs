import { Format as IPLDFormat } from 'interface-ipld-format'
import { Agent as HttpAgent } from 'http'
import { Agent as HttpsAgent } from 'https'
import { Multiaddr } from 'multiaddr'
import { CodecName } from 'multicodec'

export type LoadFormatFn = (name: CodecName) => Promise<IPLDFormat<any>>

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

export interface IPLDOptions {
  formats?: IPLDFormat<any>[]
  loadFormat?: LoadFormatFn
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
