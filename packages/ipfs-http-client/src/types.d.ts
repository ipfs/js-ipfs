import { Format as IPLDFormat } from 'interface-ipld-format'
import { LoadFormatFn } from 'ipld'
import { Agent as HttpAgent } from 'http'
import { Agent as HttpsAgent } from 'https'

export interface Options {
  host?: string
  port?: number
  protocol?: string
  headers?: Headers | Record<string, string>
  timeout?: number | sttring
  apiPath?: string
  url?: URL|string|Multiaddr
  ipld?: IPLDOptions
  agent?: HttpAgent | HttpsAgent
}

export interface IPLDOptions {
  formats?: IPLDFormat[]
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
