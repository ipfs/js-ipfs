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

type UnixFSTime = {
  secs:number,
  nsecs:number
}


type HRTime = [number, number]

type InputTime =
  | Date
  | {secs:number, nsecs?:number}
  | {Seconds:number, FractionalNanoseconds?:number}
  | HRTime

type Options<T> = {
  type:T,
  data?:Buffer,
  blockSizes?:number[],
  mode?:number,
  mtime?:InputTime

  fanout?:number
  hashType?:number
}

declare class UnixFS<T extends UnixFS.DataType = UnixFS.DataType> {
  constructor(options: Options<T> | T, content?: any);

  type:T
  mode:number
  mtime: UnixFSTime | Date


  addBlockSize(size:number): void;
  removeBlockSize(index:number): void;

  fileSize(): number;

  isDirectory(): boolean;

  marshal(): Buffer;


  static unmarshal(bytes:Buffer): UnixFS;
}

declare namespace UnixFS {
  export {DataType, DirectoryType, UnixFSTime, InputTime}
}

export = UnixFS