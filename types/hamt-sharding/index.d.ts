// Type definitions for hamt-sharding 1.0
// Project: https://github.com/ipfs-shipyard/js-hamt-sharding#readme
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped


import { BucketOptions } from "./src/bucket"
import Bucket from "./src/bucket"

declare function createHAMT <K, V>(options?: BucketOptions<V>): Bucket<K, V>;

declare namespace createHAMT {
  export function isBucket(input:any): input is Bucket;
  export { BucketOptions }
}

export = createHAMT

