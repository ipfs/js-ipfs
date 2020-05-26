import Bucket from 'hamt-sharding/src/bucket'

declare class DirSharded {
  constructor(props:any, options:any)
  put(name:string, value:Object):Promise<void>
  get(name:string):Promise<Object>
  childCount():number
  directChildrenCount():number
  onlyChild():any
  eachChildSeries():AsyncIterator<{key:string, value:Object}>
  flush(path:string, block:any, options?:any):AsyncIterator<Object>

  _bucket:Bucket

  static hashFn:HashFn
}

interface HashFn {
  (value:string|Buffer):Promise<Buffer>
  code:number
}

declare namespace DirSharded {

}

export = DirSharded