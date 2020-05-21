import CID from "cids"
import BlockService from "ipfs-block-service"
import {Buffer} from "buffer"

type PutOptions = {
  hashAlg:string|number,
  cidVersion?:number,
  onlyHash?:boolean,
  signal?:AbortSignal
}

type TaskOptions = {
  signal?:AbortSignal
}

type TreeOptions = TaskOptions & {
  recursive?:boolean
}


interface IPLDService<IPLDNode=Object> {
  /**
   * Stores the given IPLD Node of a recognized IPLD Format.
   */
  put(dagNode:IPLDNode, format:string|number, options:PutOptions):Promise<CID>
  /**
   * 
   */
  putMany(source:AsyncIterable<IPLDNode>, format:string|number, options:PutOptions):AsyncIterable<CID>
  /**
   * Retrieves IPLD Nodes along the path that is rooted at cid.
   */
  resolve(cid:CID, path?:string, options?:TaskOptions):AsyncIterable<ResolvedIPLDNode<IPLDNode>>
  /**
   * Retrieve an IPLD Node.
   */
  get(cid:CID, options?:TaskOptions):Promise<IPLDNode>
  /**
   * Retrieve several IPLD Nodes at once.
   */
  getMany(source:AsyncIterable<CID>, options?:TaskOptions):AsyncIterable<IPLDNode>
  /**
   * Remove an IPLD Node by the given cid
   */
  remove(cid:CID, options?:TaskOptions):Promise<CID>
  /**
   * Remove IPLD Nodes by the given cids
   */
  removeMany(cids:AsyncIterable<CID>, options?:TaskOptions):AsyncIterable<CID>
  /**
   * Returns all the paths that can be resolved into.
   */
  tree(cid:CID, path?:string, options?:TreeOptions):AsyncIterable<string>

  /**
   * Add support for an IPLD Format
   */
  addFormat():void
  /**
   * Remove support for an IPLD Format
   */
  removeFormat(codec:number):IPLDService<IPLDNode>
}

type ResolvedIPLDNode<IPLDNode> = {
  value:IPLDNode,
  remainderPath:string
}

type Wait<T> = T|Promise<T>

interface IPLDResolver<IPLDNode> {
  /**
   * Resolves a path within the blob, returns the value and the partial missing
   * path. This way the js-ipld can continue to resolve in case the value is a
   * link.
   */
  resolve(bytes:Buffer, path:string):Wait<ResolvedIPLDNode<IPLDNode>>
  /**
   * Returns all the paths available in this blob
   */
  tree(bytes:Buffer):Wait<Iterable<string>>
}

interface IPLDFormatUtil<IPLDNode> {
  /**
   * Serialize an IPLD Node into a binary blob.
   */
  serialize(ipldNode:IPLDNode):Wait<Buffer>,
  /**
   * Deserialize a binary blob into an IPLD Node.
   */
  deserialize(bytes:Buffer):Wait<IPLDNode>,
  /**
   * Calculate the CID of the binary blob.
   */
  cid(bytes:Buffer, options?:{cidVersion?:number, hashAlg?:string}):Wait<CID>
}

interface IPLDFormat<IPLDNode> {
  util:IPLDFormatUtil<IPLDNode>,
  resolver:IPLDResolver<IPLDNode>,
  /**
   * Default hash algorithm of the format.
   */
  defaultHashAlg:string,
  /**
   * Identifier for the format implementation.
   */
  codec:number
}

type IPLDOptions<IPLDNode> = {
  blockService?:BlockService
  formats?:IPLDFormat<IPLDNode>
  loadFormat?: (codec:number) => IPLDFormat<IPLDNode>
}

declare class IPLD implements IPLDService<Object> {
  constructor(options:IPLDOptions<Object>)
  put(dagNode: Object, format: string | number, options: PutOptions): Promise<CID>
  putMany(source: AsyncIterable<Object>, format: string | number, options: PutOptions): AsyncIterable<CID>
  resolve(cid: CID, path: string, options?: TaskOptions | undefined): AsyncIterable<ResolvedIPLDNode<Object>>
  get(cid: CID, options?: TaskOptions | undefined): Promise<Object>
  getMany(source: AsyncIterable<CID>, options?: TaskOptions | undefined): AsyncIterable<Object>
  remove(cid: CID, options?: TaskOptions | undefined): Promise<CID>
  removeMany(cids: AsyncIterable<CID>, options?: TaskOptions | undefined): AsyncIterable<CID>
  tree(cid: CID, path?: string | undefined, options?: TreeOptions | undefined): AsyncIterable<string>
  addFormat(): void
  removeFormat(codec: number): IPLDService<Object>
}

declare namespace IPLD {
  export {
    IPLDOptions,
    IPLDFormat,
    IPLDFormatUtil,
    IPLDResolver,
    Wait,
    IPLDService,
    ResolvedIPLDNode
  }
}

export=IPLD