import { Mtime } from 'ipfs-unixfs'
import { EncodedCID } from './cid'

export interface EncodedStat {
  cid: EncodedCID
  size: number
  cumulativeSize: number
  type: 'directory' | 'file'
  blocks: number
  withLocality: boolean
  local?: boolean
  sizeLocal?: number
  mode?: number
  mtime?: Mtime
}
