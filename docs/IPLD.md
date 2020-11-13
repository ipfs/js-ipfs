# IPLD Codecs <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->

- [Overview](#overview)
- [Bundled Codecs](#bundled-codecs)
- [Adding additional codecs](#adding-additional-codecs)
- [Next steps](#next-steps)

## Overview

The IPFS repo contains a blockstore that holds [Blocks](https://github.com/ipld/js-ipld-block). These blocks can be thought of as a [CID][] and associated byte array.

The [CID][] contains a `codec` property that lets us know how to interpret the byte array associated with it.

In order to perform that interpretation, an [IPLD Format][] must be loaded that corresponds to the `codec` property of the [CID][].

## Bundled Codecs

js-IPFS ships with three bundled codecs, the ones that are required to create and interpret [UnixFS][] structures.

These are:

1. [ipld-dag-pb](https://github.com/ipld/js-ipld-dag-pb) - used for file and directory structures
2. [ipld-raw](https://github.com/ipld/js-ipld-raw) - used for file data where imported with `raw-leaves=true`
3. [ipld-dag-cbor](https://github.com/ipld/js-ipld-dag-cbor) - used for general storage of JavaScript Objects

## Adding additional codecs

If your application requires support for extra codecs, you can configure them as follows:

1. Configure the [IPLD layer](https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs/docs/MODULE.md#optionsipld) of your IPFS daemon to support the codec. This step is necessary so the node knows how to prepare data received over HTTP to be passed to IPLD for serialization:
    ```javascript
    const ipfs = require('ipfs')

    const node = await ipfs({
      ipld: {
        // either specify them as part of the `formats` list
        formats: [
          require('my-format')
        ],

        // or supply a function to load them dynamically
        loadFormat: async (format) => {
          return require(format)
        }
      }
    })
2. Configure your IPFS HTTP API Client to support the codec. This is necessary so that the client can send the data to the IPFS node over HTTP:
    ```javascript
    const ipfsHttpClient = require('ipfs-http-client')

    const client = ipfsHttpClient({
      url: 'http://127.0.0.1:5002',
      ipld: {
        // either specify them as part of the `formats` list
        formats: [
          require('my-format')
        ],

        // or supply a function to load them dynamically
        loadFormat: async (format) => {
          return require(format)
        }
      }
    })
    ```

## Next steps

* See [examples/custom-ipld-formats](https://github.com/ipfs/js-ipfs/tree/master/examples/custom-ipld-formats) for runnable code that demonstrates the above with in-process IPFS nodes, IPFS run as a daemon and also the http client

[cid]: https://www.npmjs.com/package/cids
[ipld format]: https://github.com/ipld/interface-ipld-format
[unixfs]: https://github.com/ipfs/specs/blob/master/UNIXFS.md
