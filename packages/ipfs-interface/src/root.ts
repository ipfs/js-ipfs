import { AbortOptions } from './basic'
import { Options as PreloadOptions } from './preload'
import { ImportSource, IPFSEntry, ToEntry, UnixFSEntry } from './files'
import CID, { CIDVersion } from 'cids'

export interface RootAPI {
  add: Add
  addAll: AddAll
  cat: Cat
  get: Get
}

/**
 * Import a file or data into IPFS.
 */
export interface Add {
  (entry: ToEntry, options?: AddOptions): Promise<UnixFSEntry>
}

export interface AddOptions extends AbortOptions {
  /**
   * Chunking algorithm used to build ipfs DAGs. (defaults to 'size-262144')
   */
  chunker?: string
  /**
   * The CID version to use when storing the data
   */
  cidVersion?: CIDVersion

  /**
   * Multihash hashing algorithm to use. (Defaults to 'sha2-256')
   */
  hashAlg?: string

  /**
   * If true, will not add blocks to the blockstore. (Defaults to `false`)
   */
  onlyHash?: boolean

  /**
   * Pin this object when adding. (Defaults to `true`)
   */
  pin?: boolean

  /**
   * A function that will be called with the number of bytes added as a file is
   * added to ipfs and the path of the file being added.
   *
   * **Note** It will not be called for directory entries.
   */
  progress?: (bytes: number, path: string) => void

  /**
   * If true, DAG leaves will contain raw file data and not be wrapped in a
   * protobuf. (Defaults to `false`)
   */
  rawLeaves?: boolean

  /**
   * If true will use the
   * [trickle DAG](https://godoc.org/github.com/ipsn/go-ipfs/gxlibs/github.com/ipfs/go-unixfs/importer/trickle)
   * format for DAG generation. (Defaults to `false`).
   */
  trickle?: boolean

  /**
   * Adds a wrapping node around the content. (Defaults to `false`)
   */
  wrapWithDirectory?: boolean

}

/**
 * Import multiple files and data into IPFS.
 */
export interface AddAll {
  (source: ImportSource, options?: AddAllOptions & AbortOptions): AsyncIterable<UnixFSEntry>
}

export interface AddAllOptions extends AddOptions {

  /**
   * Allows to create directories with an unlimited number of entries currently
   * size of unixfs directories is limited by the maximum block size.
   * ** Note ** that this is an experimental feature. (Defaults to `false`)
   */
  enableShardingExperiment?: boolean

  /**
   * Directories with more than this number of files will be created as HAMT -
   * sharded directories. (Defaults to 1000)
   */
  shardSplitThreshold?: number
}

export interface ShardingOptions {
  sharding?: boolean
}

/**
 * Returns content of the file addressed by a valid IPFS Path or CID.
 */
export interface Cat {
  (ipfsPath: IPFSPath, options?:CatOptions): AsyncIterable<Uint8Array>
}

export interface CatOptions extends AbortOptions, PreloadOptions {
  /**
   * An offset to start reading the file from
   */
  offset?: number
  /**
   * An optional max length to read from the file
   */
  length?: number
}

/**
 * Fetch a file or an entire directory tree from IPFS that is addressed by a
 * valid IPFS Path.
 */
export interface Get {
  (ipfsPath: IPFSPath, options?: GetOptions): AsyncIterable<IPFSEntry>
}

export interface GetOptions extends AbortOptions, PreloadOptions {}

export interface List {
  /**
   * Lists a directory from IPFS that is addressed by a valid IPFS Path.
   */
  (ipfsPath: IPFSPath, options?: ListOptions): AsyncIterable<IPFSEntry>
}

export interface ListOptions extends AbortOptions, PreloadOptions {
  recursive?: boolean,
  includeContent?: boolean
}

/**
 * An IPFS path or CID
 */
export type IPFSPath = CID | string
