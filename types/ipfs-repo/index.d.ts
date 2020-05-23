

import { Buffer } from "buffer"
import Block from "ipld-block"
import { Store, Key, StoreOptions} from "interface-datastore"
import { TimeoutOptions } from "ipfs-interface"
import CID from "cids"
import * as ERRORS from "./errors"



type BlockStore = Store<CID, Block>
type RootStore = Store<string|Buffer|Key, Buffer>
type DataStore = Store<Key, Buffer>
interface ConfigStore extends Store<string, void|any>  {
  replace(value:any, options?:{signal?:AbortSignal}):Promise<void>
  get():Promise<any>
  set(value:any):Promise<void>
  getAll(options?:{signal?:AbortSignal}):Promise<any>
  exists():Promise<boolean>
}

type RepoOptions = {
  autoMigrate?:boolean,
  lock?:"fs"|"memory",
  storageBackends?:{
    root?:Store<Key, Buffer>,
    blocks?:Store<Key, Buffer>,
    keys?:Store<Key, Buffer>,
    datastore?:Store<Key, Buffer>
  }
}

interface Cell<T> {
  get(options?:TimeoutOptions):Promise<T>
  set(value:T):Promise<void>
}

interface RepoStat {
  numObjects:number,
  repoPath:string,
  repoSize:number,
  version:number,
  storageMax:number
}

declare class Repo {
  constructor(path:string, options?:RepoOptions);
  closed?:boolean;
  path?:string;
  keys:any;

  /**
   * Creates the necessary folder structure inside the repo
   */
  init(config?:Object): Promise<void>;
  /**
   * Locks the repo to prevent conflicts arising from simultaneous access
   */
  open(): Promise<void>;
  /**
   * Unlocks the repo.
   */
  close(): Promise<void>;
  /**
   * Tells whether this repo exists or not. Returned promise resolves to a boolean
   */
  exists(): Promise<boolean>;
  /**
   * The returned promise resolves to false if the repo has not been
   * initialized and true if it has
   */
  isInitialized(): Promise<boolean>;

  put(key:string|Buffer|Key, value:Buffer):Promise<void>;
  get(key:string|Buffer|Key):Promise<Buffer>;

  blocks: BlockStore;
  datastore: DataStore;
  config: ConfigStore;
  version:Cell<number>;
  apiAddr:Cell<string>;

  stat(): RepoStat;

  static repoVersion:number;
  static utils: {
    blockstore: {
        cidToKey: (cid:CID) => Key;
        keyToCid: (key:Key) => CID;
    };
  };
  static errors: typeof ERRORS

}

declare namespace Repo {
  export {
    RepoStat,
    Cell,
    RepoOptions,
    ConfigStore,
    BlockStore,
    RootStore,
    DataStore
  }
}

export = Repo