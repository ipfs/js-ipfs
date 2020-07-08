# Refs API <!-- omit in toc -->

- [`ipfs.refs(ipfsPath, [options])`](#ipfsrefsipfspath-options)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [`ipfs.refs.local([options])`](#ipfsrefslocaloptions)
  - [Parameters](#parameters-1)
  - [Options](#options-1)
  - [Returns](#returns-1)
  - [Example](#example-1)

## `ipfs.refs(ipfsPath, [options])`

> Get links (references) from an object.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ipfsPath | [CID][] or `String` | The object to search for references |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| recursive | `boolean` | `false` | Recursively list references of child nodes |
| unique | `boolean` | `false` | Omit duplicate references from output |
| format | `String` | `'<dst>'` | output edges with given format. Available tokens: `<src>`, `<dst>`, `<linkname>` |
| edges | `boolean` | `false` | output references in edge format: `"<src> -> <dst>"` |
| maxDepth | `Number` | `1` | only for recursive refs, limits fetch and listing to the given depth |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | An async iterable that yields objects representing the links (references) |

Each yielded object is of the form:

```js
{
  ref: string,
  err: Error | null
}
```

### Example

```JavaScript
for await (const ref of ipfs.refs(ipfsPath, { recursive: true })) {
  if (ref.err) {
    console.error(ref.err)
  } else {
    console.log(ref.ref)
    // output: "QmHash"
  }
}
```

## `ipfs.refs.local([options])`

> Output all local references (CIDs of all blocks in the blockstore)

Blocks in the blockstore are stored by multihash and not CID so yielded CIDs are v1 CIDs with the 'raw' codec. These may not match the CID originally used to store a given block, though the multihash contained within the CID will.

### Parameters

None

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | An async iterable that yields objects representing the links (references) |

Each yielded object is of the form:

```js
{
  ref: string,
  err: Error | null
}
```

### Example

```JavaScript
for await (const ref of ipfs.refs.local()) {
  if (ref.err) {
    console.error(ref.err)
  } else {
    console.log(ref.ref)
    // output: "QmHash"
  }
}
```

[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/files-regular
[b]: https://www.npmjs.com/package/buffer
[cid]: https://www.npmjs.com/package/cids
[blob]: https://developer.mozilla.org/en-US/docs/Web/API/Blob
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
