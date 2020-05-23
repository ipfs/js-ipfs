import CID from "cids"
import { DAGNode as DAGPBNode } from "ipld-dag-pb"
import { IPLDService } from "ipfs-interface"
import UnixFS from "ipfs-unixfs"


type DAGCBORNode = Object

interface Entry<IPLDNode> {
  name:string,
  path:string,
  cid:CID,
  node:IPLDNode,
  depth: number
}


type ContentOptions = {
  offset?: number
  length?: number
}

interface NonUnixFSEntry<T> extends Entry<T> {
  // This is so that you could do `if (entry.unixfs)` without TS telling you
  // Property 'unixfs' does not exist on type 'ExporterEntry'.
  unixfs:void
}
interface CBOREntry extends NonUnixFSEntry<JSON> {
  content?:void
}

interface RawEntry extends NonUnixFSEntry<Buffer> {
  content(options?:ContentOptions):AsyncIterable<Buffer>
}


interface UnixFSFile extends Entry<DAGPBNode> {
  content(options?:ContentOptions):AsyncIterable<Buffer>
  unixfs:UnixFS<'file'>
}

interface UnixFSDirectory extends Entry<DAGPBNode> {
  content(options?:ContentOptions):AsyncIterable<UnixFSEntry>
  unixfs:UnixFS<'directory'>|UnixFS<'hamt-sharded-directory'>
}

type UnixFSEntry =
  | UnixFSFile
  | UnixFSDirectory


type ExportOptions = {
  signal?:AbortSignal
}

type ExporterEntry =
  | RawEntry
  | CBOREntry
  | UnixFSEntry

declare function exporter(cid:CID, ipld:IPLDService, options?: ExportOptions): Promise<ExporterEntry>;

declare namespace exporter {
  export function path(path: CID | Buffer | string, ipld: IPLDService, options?: ExportOptions): AsyncIterable<ExporterEntry>;
  export function recursive(cid: CID, ipld: IPLDService, options?: ExportOptions): AsyncIterable<ExporterEntry>;

  export {
    ExporterEntry,
    Entry,
    UnixFSEntry,
    RawEntry,
    CBOREntry,
    ExportOptions,
    ContentOptions,
    UnixFSFile,
    UnixFSDirectory
  }
}

export = exporter;