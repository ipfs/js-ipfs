// Type definitions for ipfs-unixfs 1.0
// Project: https://github.com/ipfs/js-ipfs-unixfs#readme
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

type DataType =
  | 'raw'
  | 'directory'
  | 'file'
  | 'metadata'
  | 'symlink'
  | 'hamt-sharded-directory'

declare class Data {
  constructor(...args: any[]);

  type:'dir'|'file'
  mode:number
  mtime:{secs:number, nsecs:number}


  addBlockSize(size:number): void;
  removeBlockSize(index:number): void;

  fileSize(): number;

  isDirectory(): boolean;

  marshal(): Buffer;


  static unmarshal(bytes:Buffer): Data;
}

export = Data