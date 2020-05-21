import CID from "cids"
import { DAGNode } from "ipld-dag-pb"
import {IPLDService} from "ipfs-interface"



interface Entry<IPLDNode> {
  name:string,
  path:string,
  cid:CID,
  node:IPLDNode,
  content():AsyncIterable<Buffer>
}

type RawEntry  = Entry<Buffer>
type UnixFSV1Entry = Entry<DAGNode>
type CBOREntry = Entry<Object>
type ExportOptions = {
  signal?:AbortSignal
}

declare function exporter(cid:CID, ipld:IPLDService, options?: ExportOptions): UnixFSV1Entry|RawEntry|CBOREntry;

declare namespace exporter {
  function path(path: any, ipld: any, options: any): void;
  function recursive(path: any, ipld: any, options: any): void;

  export {Entry, RawEntry, CBOREntry, ExportOptions}
}

export = exporter;