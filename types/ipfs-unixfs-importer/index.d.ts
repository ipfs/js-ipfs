import { Readable } from 'stream'
import { IPLDService } from "ipfs-interface"
import { DAG, Block } from "../../packages/ipfs/src/core/components/init"
import { DAGNode as DAGPBNode } from "ipld-dag-pb"
import CID from 'cids'
import UnixFS from 'ipfs-unixfs'
import { InputTime } from "ipfs-unixfs"


type Codec = 'dag-pb' | 'dag-cbor' | 'raw'

type LeafType = 'file' | 'raw'

type ChunkValidator =
  (source:AsyncIterable<Buffer>, options:ImporterOptions) => AsyncIterable<Buffer>

type Chunker =
  (source:AsyncIterable<Buffer>, options:ImporterOptions) => AsyncIterable<Buffer>

type DagBuilderInput = {
  path: string,
  content: AsyncIterable<Buffer>
}

type DagBuiderOutput = {
  cid: CID,
  path: string,
  unixfs: UnixFS
  node: DAGPBNode
}

type DagBuilder =
  (source:AsyncIterable<DagBuilderInput>, ipld:IPLDService, options:ImporterOptions) => AsyncIterable<DagBuiderOutput>

type TreeBuilder =
  (source:AsyncIterable<DagBuiderOutput>, ipld:IPLDService, options:ImporterOptions) => AsyncIterable<ImporterOutput>

interface ImporterOptions {
  /**
   * If true, a wrapping node will be created
   */
  wrap?: boolean
  /**
   * (positive integer, defaults to 1000): the number of directory entries
   * above which we decide to use a
   */
  shardSplitThreshold?: number
  /**
   * (string, defaults to "fixed"): the chunking strategy. Supports: "fixed" and
   * "rabin"
   */
  chunker?: 'fixed' | 'rabin' | Chunker
  /**
   * (positive integer, defaults to 262144): the average chunk size (rabin chunker only)
   */
  avgChunkSize?:number,
  /**
   * (positive integer): the minimum chunk size (rabin chunker only)
   */
  minChunkSize?:number,
  /**
   * (positive integer, defaults to 262144): the maximum chunk size
   */
  maxChunkSize?:number,
  /**
   *  (defaults to "balanced"): the DAG builder strategy name.
   */
  strategy?: 'balanced' | 'flat' | 'trickle'
  /**
   * (positive integer, defaults to 174): the maximum children per node for the
   * balanced and trickle DAG builder strategies
   */
  maxChildrenPerNode?:number
  /**
   * (positive integer, defaults to 4): (only applicable to the trickle DAG
   * builder strategy). The maximum repetition of parent nodes for each layer
   * of the tree.
   */
  layerRepeat?:number,
  /**
   * (boolean, defaults to true): optimization for, when reducing a set of
   * nodes with one node, reduce it to that node.
   */
  reduceSingleLeafToSelf?:boolean,
  /**
   * A function that hashes file names to create HAMT shards
   */
  hamtHashFn?: (input:string) => Buffer|Promise<Buffer>
  /**
   * (positive integer, defaults to 8): the number of bits at each bucket of
   * the HAMT
   */
  hamtBucketBits?:number
  /**
   * a function that will be called with the byte length of chunks as a file is
   * added to ipfs.
   */
  progress?:(value:number) => void,

  /**
   * (boolean, defaults to false): Only chunk and hash - do not write to disk
   */
  onlyHash?:boolean
  /**
   * multihash hashing algorithm to use
   */
  hashAlg?: string
  /**
   * the CID version to use when storing the data (storage keys are based on
   * the CID, including it's version)
   */
  cidVersion?: number
  /**
   * (boolean, defaults to false): When a file would span multiple DAGNodes,
   * if this is true the leaf nodes will not be wrapped in UnixFS protobufs
   * and will instead contain the raw file bytes
   */
  rawLeaves?: boolean
  /**
   * (string, defaults to 'file') what type of UnixFS node leaves should be -
   * can be 'file' or 'raw' (ignored when rawLeaves is true)
   */
  leafType?: LeafType
  /**
   * (positive integer, defaults to 10) How many blocks to hash and write to
   * the block store concurrently. For small numbers of large files this should
   * be high (e.g. 50).
   */
  blockWriteConcurrency?:number
  /**
   *  (number, defaults to 50) How many files to import concurrently. For large
   * numbers of small files this should be high (e.g. 50).
   */
  fileImportConcurrency?:number
  /**
   * (boolean, defaults to false) Whether to pin each block as it is created)
   */
  pin?:boolean
  /**
   * (boolean, defaults to false) Whether to preload each block as it is created
   */
  preload?:boolean
  /**
    This function takes input from the content field of imported entries. It
    should transform them into Buffers, throwing an error if it cannot.
    It should yield Buffer objects constructed from the source or throw an Error
   */
  chunkValidator?:ChunkValidator
  dagBuilder?:DagBuilder,
  treeBuilder?:TreeBuilder,
  

  hashOnly?: boolean

  codec?: Codec
  format?: Codec

  wrapWithDirectory?: boolean
}


interface ImporterInput {
  path?: string
  content: Buffer | Iterable<Buffer> | Readable | AsyncIterable<Buffer>
  mode?:number
  mtime?: InputTime
}

interface ImporterOutput {
  cid: CID,
  path: string,
  unixfs: UnixFS,
  size: number
}

declare function importer(
  source: AsyncIterable<ImporterInput> | Iterable<ImporterInput>,
  ipld: IPLDService | DAG | Block,
  options: ImporterOptions
): AsyncIterable<ImporterOutput>
declare namespace importer {
  export {
    ImporterOptions,
    ImporterOutput,
    ImporterInput,
    InputTime,


    ChunkValidator,
    Chunker,
    DagBuilderInput,
    DagBuiderOutput,
    DagBuilder,
    TreeBuilder,
  }
}


export=importer