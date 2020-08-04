# IPFS Module <!-- omit in toc -->

Use the IPFS module as a dependency of your project to spawn in process instances of IPFS in node.js, the browser, electron, etc.

## Table of contents <!-- omit in toc -->

- [Getting started](#getting-started)
- [IPFS.create([options])](#ipfscreateoptions)
  - [`options.repo`](#optionsrepo)
  - [`options.repoAutoMigrate`](#optionsrepoautomigrate)
  - [`options.init`](#optionsinit)
  - [`options.start`](#optionsstart)
  - [`options.pass`](#optionspass)
  - [`options.silent`](#optionssilent)
  - [`options.relay`](#optionsrelay)
  - [`options.offline`](#optionsoffline)
  - [`options.preload`](#optionspreload)
  - [`options.EXPERIMENTAL`](#optionsexperimental)
  - [`options.config`](#optionsconfig)
  - [`options.ipld`](#optionsipld)
  - [`options.libp2p`](#optionslibp2p)
  - [Instance methods](#instance-methods)
    - [`node.start()`](#nodestart)
- [Static types and utils](#static-types-and-utils)
      - [Glob source](#glob-source)
        - [`globSource(path, [options])`](#globsourcepath-options)
        - [Example](#example)
      - [URL source](#url-source)
        - [`urlSource(url)`](#urlsourceurl)
        - [Example](#example-1)

## Getting started

Create a running node with:

```javascript
// Create the IPFS node instance
const node = await IPFS.create()
// Your node is now ready to use \o/

await node.stop()
// node is now 'offline'
```

The node returned from `IPFS.create()` supports the [IPFS Core API](https://github.com/ipfs/js-ipfs/tree/master/docs/core-api), along with some additional methods documented below.

## IPFS.create([options])

```js
const node = await IPFS.create([options])
```

Creates and returns a ready to use instance of an IPFS node.

Use the `options` argument to specify advanced configuration. It is an object with any of these properties:

### `options.repo`

| Type | Default |
|------|---------|
| string or [`ipfs.Repo`](https://github.com/ipfs/js-ipfs-repo) instance | `'~/.jsipfs'` in Node.js, `'ipfs'` in browsers |

The file path at which to store the IPFS node’s data. Alternatively, you can set up a customized storage system by providing an [`ipfs.Repo`](https://github.com/ipfs/js-ipfs-repo) instance.

Example:

```js
// Store data outside your user directory
const node = await IPFS.create({ repo: '/var/ipfs/data' })
```

### `options.repoAutoMigrate`

| Type | Default |
|------|---------|
| `boolean` | `true` |

`js-ipfs` comes bundled with a tool that automatically migrates your IPFS repository when a new version is available.

**For apps that build on top of `js-ipfs` and run in the browser environment, be aware that disabling automatic
migrations leaves the user with no way to run the migrations because there is no CLI in the browser. In such
a case, you should provide a way to trigger migrations manually.**

### `options.init`

| Type | Default |
|------|---------|
| boolean or object | `true` |

Perform repo initialization steps when creating the IPFS node.

Note that *initializing* a repo is different from creating an instance of [`ipfs.Repo`](https://github.com/ipfs/js-ipfs-repo). The IPFS constructor sets many special properties when initializing a repo, so you should usually not try and call `repoInstance.init()` yourself.

Instead of a boolean, you may provide an object with custom initialization options. All properties are optional:

- `emptyRepo` (boolean) Whether to remove built-in assets, like the instructional tour and empty mutable file system, from the repo. (Default: `false`)
- `algorithm` (string) The type of key to use. Supports `rsa`, `ed25519`, `secp256k1`. (Default: `rsa`)
- `bits` (number) Number of bits to use in the generated key pair (rsa only). (Default: `2048`)
- `privateKey` (string/PeerId) A pre-generated private key to use. Can be either a base64 string or a [PeerId](https://github.com/libp2p/js-peer-id) instance. **NOTE: This overrides `bits`.**
    ```js
    // Generating a Peer ID:
    const PeerId = require('peer-id')
    // Generates a new Peer ID, complete with public/private keypair
    // See https://github.com/libp2p/js-peer-id
    const peerId = await PeerId.create({ bits: 2048 })
    ```
- `pass` (string) A passphrase to encrypt keys. You should generally use the [top-level `pass` option](#optionspass) instead of the `init.pass` option (this one will take its value from the top-level option if not set).
- `profiles` (Array) Apply profile settings to config.
- `allowNew` (boolean, default: `true`) Set to `false` to disallow initialization if the repo does not already exist.

### `options.start`

| Type | Default |
|------|---------|
| `boolean` | `true` |

 If `false`, do not automatically start the IPFS node. Instead, you’ll need to manually call [`node.start()`](#nodestart) yourself.

### `options.pass`

| Type | Default |
|------|---------|
| string | `null` |

A passphrase to encrypt/decrypt your keys.

### `options.silent`

| Type | Default |
|------|---------|
| Boolean | `false` |

Prevents all logging output from the IPFS node.

### `options.relay`

| Type | Default |
|------|---------|
| object | `{ enabled: true, hop: { enabled: false, active: false } }` |

Configure circuit relay (see the [circuit relay tutorial](https://github.com/ipfs/js-ipfs/tree/master/examples/circuit-relaying) to learn more).

- `enabled` (boolean): Enable circuit relay dialer and listener. (Default: `true`)
- `hop` (object)
    - `enabled` (boolean): Make this node a relay (other nodes can connect *through* it). (Default: `false`)
    - `active` (boolean): Make this an *active* relay node. Active relay nodes will attempt to dial a destination peer even if that peer is not yet connected to the relay. (Default: `false`)

### `options.offline`

| Type | Default |
|------|---------|
| Boolean | `false` |

Run ipfs node offline. The node does not connect to the rest of the network but provides a local API.

### `options.preload`

| Type | Default |
|------|---------|
| object | `{ enabled: true, addresses: [...] }` |

Configure remote preload nodes. The remote will preload content added on this node, and also attempt to preload objects requested by this node.

- `enabled` (boolean): Enable content preloading (Default: `true`)
- `addresses` (array): Multiaddr API addresses of nodes that should preload content. **NOTE:** nodes specified here should also be added to your node's bootstrap address list at [`config.Boostrap`](#optionsconfig).

### `options.EXPERIMENTAL`

| Type | Default |
|------|---------|
| object | `{ ipnsPubsub: false, sharding: false }` |

Enable and configure experimental features.

- `ipnsPubsub` (boolean): Enable pub-sub on IPNS. (Default: `false`)
- `sharding` (boolean): Enable directory sharding. Directories that have many child objects will be represented by multiple DAG nodes instead of just one. It can improve lookup performance when a directory has several thousand files or more. (Default: `false`)

### `options.config`

| Type | Default |
|------|---------|
| object |  [`config-nodejs.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/config-nodejs.js) in Node.js, [`config-browser.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/config-browser.js) in browsers |

Modify the default IPFS node config. This object will be *merged* with the default config; it will not replace it. The default config is documented in [the js-ipfs config file docs](docs/config.md).

### `options.ipld`

 | Type | Default |
|------|---------|
| object |  [`ipld-nodejs.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/ipld-nodejs.js) in Node.js, [`ipld-browser.js`](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core/runtime/ipld-browser.js) in browsers |

 Modify the default IPLD config. This object will be *merged* with the default config; it will not replace it. Check IPLD [docs](https://github.com/ipld/js-ipld#ipld-constructor) for more information on the available options.

 > Browser config does **NOT** include by default all the IPLD formats. Only `ipld-dag-pb`, `ipld-dag-cbor` and `ipld-raw` are included.

 To add support for other formats we provide two options, one sync and another async.

 Examples for the sync option:

<details><summary>ESM Environments</summary>

```js
import ipldGit from 'ipld-git'
import ipldBitcoin from 'ipld-bitcoin'

const node = await IPFS.create({
  ipld: {
    formats: [ipldGit, ipldBitcoin]
  }
})
```
</details>
<details><summary>Commonjs Environments</summary>

```js
const node = await IPFS.create({
  ipld: {
    formats: [require('ipld-git'), require('ipld-bitcoin')]
  }
})
```
</details>
<details><summary>Using script tags</summary>

```html
<script src="https://unpkg.com/ipfs/dist/index.min.js"></script>
<script src="https://unpkg.com/ipld-git/dist/index.min.js"></script>
<script src="https://unpkg.com/ipld-bitcoin/dist/index.min.js"></script>
<script>
async function main () {
  const node = await self.IPFS.create({
    ipld: {
      formats: [self.IpldGit, self.IpldBitcoin]
    }
  })
}
main()
</script>
```
</details>

 Examples for the async option:

<details><summary>ESM Environments</summary>

```js
const node = await IPFS.create({
  ipld: {
    async loadFormat (codec) {
      if (codec === multicodec.GIT_RAW) {
        return import('ipld-git') // This is a dynamic import
      } else {
        throw new Error('unable to load format ' + multicodec.print[codec])
      }
    }
  }
})
```
> For more information about dynamic imports please check [webpack docs](https://webpack.js.org/guides/code-splitting/#dynamic-imports) or search your bundler documention.

Using dynamic imports will tell your bundler to create a separate file (normally called *chunk*) that will **only** be requested by the browser if it's really needed. This strategy will reduce your bundle size and load times without removing any functionality.

With Webpack IPLD formats can even be grouped together using magic comments `import(/* webpackChunkName: "ipld-formats" */ 'ipld-git')` to produce a single file with all of them.
</details>

<details><summary>Commonjs Environments</summary>

```js
const node = await IPFS.create({
  ipld: {
    async loadFormat (codec) {
      if (codec === multicodec.GIT_RAW) {
        return require('ipld-git')
      } else {
        throw new Error('unable to load format ' + multicodec.print[codec])
      }
    }
  }
})
```
</details>

<details><summary>Using Script tags</summary>

```js
<script src="https://unpkg.com/ipfs/dist/index.min.js"></script>
<script>
const load = (name, url) => new Promise((resolve, reject) => {
  const script = document.createElement('script')
  script.src = url
  script.onload = () => resolve(self[name])
  script.onerror = () => reject(new Error('Failed to load ' + url))
  document.body.appendChild(script)
})

const node = await self.IPFS.create({
  ipld: {
    async loadFormat (codec) {
      switch (codec) {
        case multicodec.GIT_RAW:
          return load('IpldGit', 'https://unpkg.com/ipld-git/dist/index.min.js')
        case multicodec.BITCOIN_BLOCK:
          return load('IpldBitcoin', 'https://unpkg.com/ipld-bitcoin/dist/index.min.js')
        default:
          throw new Error('Unable to load format ' + multicodec.print[codec])
      }
    }
  }
})
</script>
```
</details>


### `options.libp2p`

| Type | Default |
|------|---------|
| object | [`libp2p-nodejs.js`](../src/core/runtime/libp2p-nodejs.js) in Node.js, [`libp2p-browser.js`](../src/core/runtime/libp2p-browser.js) in browsers |
| function | [`libp2p bundle`](https://github.com/ipfs/js-ipfs/tree/master/examples/custom-libp2p) |

The libp2p option allows you to build your libp2p node by configuration, or via a bundle function. If you are looking to just modify the below options, using the object format is the quickest way to get the default features of libp2p. If you need to create a more customized libp2p node, such as with custom transports or peer/content routers that need some of the ipfs data on startup, a custom bundle is a great way to achieve this.

You can see the bundle in action in the [custom libp2p example](https://github.com/ipfs/js-ipfs/tree/master/examples/custom-libp2p).

Please see [libp2p/docs/CONFIGURATION.md](https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md) for the list of options libp2p supports.

### Instance methods

#### `node.start()`

Start listening for connections with other IPFS nodes on the network. In most cases, you do not need to call this method — `IPFS.create()` will automatically do it for you.

This method is asynchronous and returns a promise.

```js
const node = await IPFS.create({ start: false })
console.log('Node is ready to use but not started!')

try {
  await node.start()
  console.log('Node started!')
} catch (error) {
  console.error('Node failed to start!', error)
}
```

## Static types and utils

Aside from the default export, `ipfs` exports various types and utilities that are included in the bundle:

- [`crypto`](https://www.npmjs.com/package/libp2p-crypto)
- [`isIPFS`](https://www.npmjs.com/package/is-ipfs)
- [`Buffer`](https://www.npmjs.com/package/buffer)
- [`PeerId`](https://www.npmjs.com/package/peer-id)
- [`PeerInfo`](https://www.npmjs.com/package/peer-info)
- [`multiaddr`](https://www.npmjs.com/package/multiaddr)
- [`multibase`](https://www.npmjs.com/package/multibase)
- [`multihash`](https://www.npmjs.com/package/multihashes)
- [`multihashing`](https://www.npmjs.com/package/multihashing-async)
- [`multicodec`](https://www.npmjs.com/package/multicodec)
- [`CID`](https://www.npmjs.com/package/cids)

These can be accessed like this, for example:

```js
const { CID } = require('ipfs')
// ...or from an es-module:
import { CID } from 'ipfs'
```

##### Glob source

A utility to allow files on the file system to be easily added to IPFS.

###### `globSource(path, [options])`

- `path`: A path to a single file or directory to glob from
- `options`: Optional options
- `options.recursive`: If `path` is a directory, use option `{ recursive: true }` to add the directory and all its sub-directories.
- `options.ignore`: To exclude file globs from the directory, use option `{ ignore: ['ignore/this/folder/**', 'and/this/file'] }`.
- `options.hidden`: Hidden/dot files (files or folders starting with a `.`, for example, `.git/`) are not included by default. To add them, use the option `{ hidden: true }`.

Returns an async iterable that yields `{ path, content }` objects suitable for passing to `ipfs.add`.

###### Example

```js
const IPFS = require('ipfs')
const { globSource } = IPFS
const ipfs = await IPFS.create()
for await (const file of ipfs.addAll(globSource('./docs', { recursive: true }))) {
  console.log(file)
}
/*
{
  path: 'docs/assets/anchor.js',
  cid: CID('QmVHxRocoWgUChLEvfEyDuuD6qJ4PhdDL2dTLcpUy3dSC2'),
  size: 15347
}
{
  path: 'docs/assets/bass-addons.css',
  cid: CID('QmPiLWKd6yseMWDTgHegb8T7wVS7zWGYgyvfj7dGNt2viQ'),
  size: 232
}
...
*/
```

##### URL source

A utility to allow content from the internet to be easily added to IPFS.

###### `urlSource(url)`

- `url`: A string URL or [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) instance to send HTTP GET request to

Returns an async iterable that yields `{ path, content }` objects suitable for passing to `ipfs.add`.

###### Example

```js
const IPFS = require('ipfs')
const { urlSource } = IPFS
const ipfs = await IPFS.create()

const file = await ipfs.add(urlSource('https://ipfs.io/images/ipfs-logo.svg'))
console.log(file)

/*
{
  path: 'ipfs-logo.svg',
  cid: CID('QmTqZhR6f7jzdhLgPArDPnsbZpvvgxzCZycXK7ywkLxSyU'),
  size: 3243
}
*/
```
