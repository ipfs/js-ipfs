import type CID from 'cids';
import type { AbortOptions } from '../../utils'
import type { DAGLink } from 'ipld-dag-pb'

export type DAGLinkRawLike = ({
  Name: string
  Hash: CID | string
  name?: undefined
  cid?: undefined
} | {
  Name?: undefined
  Hash?: undefined
  name: string
  cid: CID | string
}) & {
  size: number
}

export interface API<OptionExtension = {}> {
  addLink: (cid: CID, link: DAGLink | DAGLinkRawLike, options?: AbortOptions & OptionExtension) => Promise<CID>
  rmLink: (cid: CID, link: DAGLink | DAGLinkRawLike, options?: AbortOptions & OptionExtension) => Promise<CID>
  appendData: (cid: CID, data: Uint8Array, options?: AbortOptions & OptionExtension) => Promise<CID>
  setData: (cid: CID, data: Uint8Array, options?: AbortOptions & OptionExtension) => Promise<CID>
}
