# IPLD Codecs <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->

- [Overview](#overview)
- [Bundled BlockCodecs](#bundled-blockcodecs)
- [Bundled Multihashes](#bundled-multihashes)
- [Bundled Multibases](#bundled-multibases)
- [Adding additional BlockCodecs, Multihashes and Multibases](#adding-additional-blockcodecs-multihashes-and-multibases)
- [Next steps](#next-steps)

## Overview

The IPFS repo contains a blockstore that holds the data that makes up the files on the IPFS network. These blocks can be thought of as a [CID][] and associated byte array.

The [CID][] contains a `code` property that lets us know how to interpret the byte array associated with it.

In order to perform that interpretation, a [BlockCodec][] must be loaded that corresponds to the `code` property of the [CID][].

Similarly implementations of [Multihash][]es or [Multibase][]s must be available to be used.

## Bundled BlockCodecs

js-IPFS ships with four bundled codecs, the ones that are required to create and interpret [UnixFS][] structures.

These are:

1. [@ipld/dag-pb](https://github.com/ipld/js-dag-pb) - used for file and directory structures
2. [raw](https://github.com/multiformats/js-multiformats/blob/master/src/codecs/raw.js) - used for file data where imported with `--raw-leaves=true`
3. [@ipld/dag-cbor](https://github.com/ipld/js-dag-cbor) - used for storage of JavaScript Objects with [CID] links to other blocks
4. [json](https://github.com/multiformats/js-multiformats/blob/master/src/codecs/json.js) - used for storage of plain JavaScript Objects

## Bundled Multihashes

js-IPFS ships with all multihashes [exported by js-multiformats](https://github.com/multiformats/js-multiformats/tree/master/src/hashes), including `sha2-256` and others.

Additional hashers can be configured using the `hashers` config property.

## Bundled Multibases

js-IPFS ships with all multibases [exported by js-multiformats](https://github.com/multiformats/js-multiformats/tree/master/src/bases), including `base58btc`, `base32` and others.

Additional bases can be configured using the `bases` config property.

## Adding additional BlockCodecs, Multihashes and Multibases

If your application requires support for extra codecs, you can configure them as follows:

1. Configure the [IPLD layer](https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs/docs/MODULE.md#optionsipld) of your IPFS daemon to support the codec. This step is necessary so the node knows how to prepare data received over HTTP to be passed to IPLD for serialization:

    ```javascript
    import { create } from 'ipfs'
    import customBlockCodec from 'custom-blockcodec'
    import customMultibase from 'custom-multibase'
    import customMultihasher from 'custom-multihasher'

    const node = await create({
      ipld: {
        // either specify BlockCodecs as part of the `codecs` list
        codecs: [
          customBlockCodec
        ],

        // and/or supply a function to load them dynamically
        loadCodec: async (codecNameOrCode) => {
          return import(codecNameOrCode)
        },

        // either specify Multibase codecs as part of the `bases` list
        bases: [
          customMultibase
        ],

        // and/or supply a function to load them dynamically
        loadBase: async (baseNameOrCode) => {
          return import(baseNameOrCode)
        },

        // either specify Multihash hashers as part of the `hashers` list
        hashers: [
          customMultihasher
        ],

        // and/or supply a function to load them dynamically
        loadHasher: async (hashNameOrCode) => {
          return import(hashNameOrCode)
        }
      }
    })
   ```

2. Configure your IPFS HTTP API Client to support the codec. This is necessary so that the client can send the data to the IPFS node over HTTP:

    ```javascript
    import { create } from 'ipfs-http-client'
    import customBlockCodec from 'custom-blockcodec'
    import customMultibase from 'custom-multibase'
    import customMultihasher from 'custom-multihasher'

    const client = create({
      url: 'http://127.0.0.1:5002',
      ipld: {
        // either specify BlockCodecs as part of the `codecs` list
        codecs: [
          customBlockCodec
        ],

        // and/or supply a function to load them dynamically
        loadCodec: async (codecNameOrCode) => {
          return import(codecNameOrCode)
        },

        // either specify Multibase codecs as part of the `bases` list
        bases: [
          customMultibase
        ],

        // and/or supply a function to load them dynamically
        loadBase: async (baseNameOrCode) => {
          return import(baseNameOrCode)
        },

        // either specify Multihash hashers as part of the `hashers` list
        hashers: [
          customMultihasher
        ],

        // and/or supply a function to load them dynamically
        loadHasher: async (hashNameOrCode) => {
          return import(hashNameOrCode)
        }
      }
    })
    ```

## Next steps

* See [examples/custom-ipld-formats](https://github.com/ipfs-examples/js-ipfs-examples/tree/master/examples/custom-ipld-formats) for runnable code that demonstrates the above with in-process IPFS nodes, IPFS run as a daemon and also the http client
* Also [examples/traverse-ipld-graphs](https://github.com/ipfs-examples/js-ipfs-examples/tree/master/examples/traverse-ipld-graphs) which uses the [ipld-format-to-blockcodec](https://www.npmjs.com/package/ipld-format-to-blockcodec) module to use older [IPLD format][]s that have not been ported over to the new [BlockCodec][] interface, as well as additional [Multihash Hashers](https://www.npmjs.com/package/multiformats#multihash-hashers).

[cid]: https://docs.ipfs.io/concepts/content-addressing/
[blockcodec]: https://www.npmjs.com/package/multiformats#multicodec-encoders--decoders--codecs
[unixfs]: https://github.com/ipfs/specs/blob/master/UNIXFS.md
[ipld format]: https://github.com/ipld/interface-ipld-format
[multihash]: https://github.com/multiformats/multihash
[multibase]: https://github.com/multiformats/multibase