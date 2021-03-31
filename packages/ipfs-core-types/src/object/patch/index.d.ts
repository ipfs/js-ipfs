import type CID from 'cids';
import type { AbortOptions } from '../../utils'
import type { DAGLink } from 'ipld-dag-pb'

export interface API<OptionExtension = {}> {
  addLink: (cid: CID, link: DAGLink, options?: AbortOptions & OptionExtension) => Promise<CID>
  rmLink: (cid: CID, link: DAGLink | string, options?: AbortOptions & OptionExtension) => Promise<CID>
  appendData: (cid: CID, data: Uint8Array, options?: AbortOptions & OptionExtension) => Promise<CID>
  setData: (cid: CID, data: Uint8Array, options?: AbortOptions & OptionExtension) => Promise<CID>
}
