import { Injectable } from '@angular/core';

import * as IPFS from 'ipfs';
import * as IPFS_ROOT_TYPES from 'ipfs-core-types/src/root';
import * as IPFS_UTILS_TYPES from 'ipfs-core-types/src/utils';
import { BehaviorSubject, } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class IpfsService {
  private _ipfsSource = new BehaviorSubject<null | IPFS.IPFS>(null);
  private _createIPFSNodePromise: Promise<IPFS.IPFS>;

  private get ipfs() {
    const getter = async () => {
      let node = this._ipfsSource.getValue();

      if (node == null) {
        console.log("Waiting node creation...")

        node = await this._createIPFSNodePromise as IPFS.IPFS
        this._ipfsSource.next(node);
      }

      return node;
    }

    return getter();
  }

  constructor() {
    console.log("Starting new node...")

    this._createIPFSNodePromise = IPFS.create()
  }

  /**
   * @description Get the ID information about the current IPFS node
   * @return {Promise<IPFS_ROOT_TYPES.IDResult>}
   */
  async getId(): Promise<IPFS_ROOT_TYPES.IDResult> {
    const node = await this.ipfs;
    return await node.id();
  }

  /**
   * @description Get the version information about the current IPFS node
   * @return {Promise<IPFS_ROOT_TYPES.VersionResult>}
   */
  async getVersion(): Promise<IPFS_ROOT_TYPES.VersionResult> {
    const node = await this.ipfs;
    return await node.version();
  }

  /**
   * @description Get the status of the current IPFS node
   * @returns {Promise<boolean>}
   */
  async getStatus(): Promise<boolean> {
    const node = await this.ipfs;
    return await node.isOnline();
  }

  /**
   * @description Add a file with the given options
   * @param {IPFS_UTILS_TYPES.ImportCandidate} entry
   * @param {IPFS_ROOT_TYPES.AddOptions} [options={}]
   * @return {Promise<IPFS_ROOT_TYPES.AddResult>}
   */
  async add(entry: IPFS_UTILS_TYPES.ImportCandidate, options: IPFS_ROOT_TYPES.AddOptions = {}): Promise<IPFS_ROOT_TYPES.AddResult>{
    console.log(`Adding file ${entry} ...`)
    console.log(entry)

    const node = await this.ipfs
    const result = await node.add(entry, options)

    this._ipfsSource.next(node);
    console.log(result)
    return result;
  }

  /**
   * @description Add files with the given options
   * @param {IPFS_UTILS_TYPES.ImportCandidate[]} entries
   * @param {IPFS_ROOT_TYPES.AddAllOptions} [options={}]
   * @return {Promise<IPFS_ROOT_TYPES.AddResult[]>}
   */
  async addAll(entries: IPFS_UTILS_TYPES.ImportCandidate[], options: IPFS_ROOT_TYPES.AddAllOptions = {}): Promise<IPFS_ROOT_TYPES.AddResult[]>{
    console.log("Adding files...")
    const results = []
    const node = await this.ipfs

    for await (const result of node.addAll(entries, options)) {
      console.log(result)
      results.push(result)
    }

    this._ipfsSource.next(node);
    return results;
  }

  /**
   * @description Get file(s) of a given path
   * @param {IPFS_UTILS_TYPES.IPFSPath} ipfsPath
   * @param {IPFS_ROOT_TYPES.GetOptions} [options={}]
   * @param {boolean} [onlyFiles=true]
   * @return {Promise<Array<[IPFS_ROOT_TYPES.IPFSEntry, string]>>}
   */
  async get(ipfsPath: IPFS_UTILS_TYPES.IPFSPath, options: IPFS_ROOT_TYPES.GetOptions = {}, onlyFiles = true):
    Promise<Array<[IPFS_ROOT_TYPES.IPFSEntry, string]>>{
    console.log(`Returning file for ${ipfsPath}...`)
    const results = [] as Array<[IPFS_ROOT_TYPES.IPFSEntry, string]>
    const node = await this.ipfs

    for await (const file of node.get(ipfsPath, options)) {
      const content = []

      if ('content' in file && file.content) {
        for await (const chunk of file.content) {
          content.push(chunk)
        }
      }

      if (content.length > 0 || !onlyFiles) {
        results.push([file, content.toString()])
      }
    }

    console.log(results)
    return results
  }

  /**
   * @description Read a file
   * @param {IPFS_UTILS_TYPES.IPFSPath} ipfsPath
   * @param {IPFS_ROOT_TYPES.CatOptions} [options={}]
   * @return {(Promise<string | null>)}
   */
  async cat (ipfsPath: IPFS_UTILS_TYPES.IPFSPath, options: IPFS_ROOT_TYPES.CatOptions = {}):
    Promise<string | null> {
    console.log(`Reading file for ${ipfsPath} ...`);
    const content = []
    const node = await this.ipfs

    for await (const chunk of node.cat(ipfsPath, options)) {
        content.push(chunk)
    }

    let result = null;

    if (content.length > 0) {
        result = content.toString();
    }

    console.log(content)
    return result;
  }

  /**
   * @description List the file(s) and directory(ies) of a given path
   * @param {IPFS_UTILS_TYPES.IPFSPath} ipfsPath
   * @param {IPFS_ROOT_TYPES.ListOptions} [options={}]
   * @returns {Promise<Array<IPFS_ROOT_TYPES.IPFSEntry>>}
   */
  async ls (ipfsPath: IPFS_UTILS_TYPES.IPFSPath, options: IPFS_ROOT_TYPES.ListOptions = {}):
    Promise<Array<IPFS_ROOT_TYPES.IPFSEntry>> {
    console.log(`Listing files for ${ipfsPath} ...`);
    const result = [];
    const node = await this.ipfs

    for await (const data of node.ls(ipfsPath, options)) {
        result.push(data)
    }

    console.log(result)
    return result;
  }
}
