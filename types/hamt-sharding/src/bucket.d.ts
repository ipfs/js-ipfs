declare class Bucket<K=string, V=string> {
  static isBucket(input:any):input is Bucket
  constructor(options:BucketOptions<V>, parent?:Bucket<K, V>, posAtParent?:number)
  put(key:K, value:V):Promise<void>
  get(key:K):Promise<V>
  del(key:K):Promise<void>
  leafCount():number
  childrenCount():number
  onlyChild():Child<K, V>

  eachLeafSeries():Iterator<Child<K, V>>
  serialize <E, R>(map:(child:Child<K, V>, index:number) => E, reduce: (entries:E[]) => R):R
  toJSON():JSON
  prettyPrint():string
  tableSize():number
}

type Place<K, V> = {
  bucket: Bucket<K, V>
  pos: number,
  hash: Uint8Array
}

type Child<K, V> = {
  key:K
  value:V,
  hash:Uint8Array
}

type BucketOptions<V> = {
  bits?:number,
  hashFn?:(value:V) => Uint8Array

}

declare namespace Bucket {
  export { Child, Place, BucketOptions }
}

export = Bucket