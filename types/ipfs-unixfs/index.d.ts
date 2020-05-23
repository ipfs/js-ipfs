type DataType =
  | 'raw'
  | 'directory'
  | 'file'
  | 'metadata'
  | 'symlink'
  | 'hamt-sharded-directory'

type DirectoryType =
  | 'directory'
  | 'hamt-sharded-directory'

declare class UnixFS<T extends UnixFS.DataType = UnixFS.DataType> {
  constructor(type: T, content?: any);

  type:T
  mode:number
  mtime:{secs:number, nsecs:number}


  addBlockSize(size:number): void;
  removeBlockSize(index:number): void;

  fileSize(): number;

  isDirectory(): boolean;

  marshal(): Buffer;


  static unmarshal(bytes:Buffer): UnixFS;
}

declare namespace UnixFS {
  export {DataType, DirectoryType}
}

export = UnixFS