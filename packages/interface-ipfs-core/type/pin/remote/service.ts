import { AbortOptions } from '../../basic'

export interface API {
  /**
   * Registers remote pinning service with a given name. Errors if service
   * with the given name is already registered.
   */
  add(name: string, credentials:Credentials & AbortOptions): Promise<void>

  /**
   * Unregisteres remote pinning service with a given name. If service with such
   * name isn't registerede this is a noop.
   */
  rm(name: string, options?:AbortOptions):Promise<void>

  /**
   * List registered remote pinning services.
   */
  ls(options:ListOptions & AbortOptions):Promise<RemotePinService[]>
}

export interface Credentials {
  /**
   * Service URL
   */
  url: URL
  /**
   * Service key
   */
  key: string
}

export interface RemotePinService {
  /**
   * Service name
   */
  service: string
  /**
   * Service URL
   */
  url: URL
  /**
   * Pin count on the remote service. It is fetched from the remote service and
   * is done only if `pinCount` option is used. Furthermore it may not be
   * present if service was unreachable.
   */
  stat?: Stat
}

export interface ListOptions {
  /**
   * If `true` will try to fetch and include current pin count on the remote
   * service.
   */
  stat?: boolean
}

export type Stat = ValidStat | InvalidStat

type ValidStat = {
  status: 'valid'
  pinCount: PinCount
}

type InvalidStat = {
  status: 'invalid'
  pinCount?: void
}
export type PinCount = {
  queued: number,
  pinning: number,
  pinned: number,
  failed: number
}
