# PubSub API <!-- omit in toc -->

- [`ipfs.pubsub.subscribe(topic, handler, [options])`](#ipfspubsubsubscribetopic-handler-options)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [`ipfs.pubsub.unsubscribe(topic, handler, [options])`](#ipfspubsubunsubscribetopic-handler-options)
  - [Parameters](#parameters-1)
  - [Options](#options-1)
  - [Returns](#returns-1)
  - [Example](#example-1)
  - [Notes](#notes)
- [`ipfs.pubsub.publish(topic, data, [options])`](#ipfspubsubpublishtopic-data-options)
  - [Returns](#returns-2)
  - [Example](#example-2)
- [`ipfs.pubsub.ls([options])`](#ipfspubsublsoptions)
  - [Parameters](#parameters-2)
  - [Options](#options-2)
  - [Returns](#returns-3)
  - [Example](#example-3)
- [`ipfs.pubsub.peers(topic, [options])`](#ipfspubsubpeerstopic-options)
  - [Returns](#returns-4)
  - [Example](#example-4)

## `ipfs.pubsub.subscribe(topic, handler, [options])`

> Subscribe to a pubsub topic.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| topic | `String` | The topic name |
| handler | `Function<(msg) => {}>` | Event handler which will be called with a message object everytime one is received. The `msg` has the format `{from: String, seqno: Uint8Array, data: Uint8Array, topicIDs: Array<String>}` |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

### Example

```JavaScript
const topic = 'fruit-of-the-day'
const receiveMsg = (msg) => console.log(new TextDecoder().decode(msg.data))

await ipfs.pubsub.subscribe(topic, receiveMsg)
console.log(`subscribed to ${topic}`)
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.pubsub.unsubscribe(topic, handler, [options])`

> Unsubscribes from a pubsub topic.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| topic | `String` | The topic to unsubscribe from |
| handler | `Function<(msg) => {}>` | The handler to remove |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

### Example

```JavaScript
const topic = 'fruit-of-the-day'
const receiveMsg = (msg) => console.log(msg.toString())

await ipfs.pubsub.subscribe(topic, receiveMsg)
console.log(`subscribed to ${topic}`)

await ipfs.pubsub.unsubscribe(topic, receiveMsg)
console.log(`unsubscribed from ${topic}`)
```

Or removing all listeners:

```JavaScript
const topic = 'fruit-of-the-day'
const receiveMsg = (msg) => console.log(msg.toString())

await ipfs.pubsub.subscribe(topic, receiveMsg);

// Will unsubscribe ALL handlers for the given topic
await ipfs.pubsub.unsubscribe(topic);
```

A great source of [examples][] can be found in the tests for this API.

### Notes

If the `topic` and `handler` are provided, the `handler` will no longer receive updates for the `topic`. This behaves like [EventEmitter.removeListener](https://nodejs.org/dist/latest/docs/api/events.html#events_emitter_removelistener_eventname_listener). If the `handler` is not equivalent to the `handler` provided on `subscribe`, no action will be taken.

If **only** the `topic` param is provided, unsubscribe will remove **all** handlers for the `topic`. This behaves like [EventEmitter.removeAllListeners](https://nodejs.org/dist/latest/docs/api/events.html#events_emitter_removealllisteners_eventname). Use this if you would like to no longer receive any updates for the `topic`.

## `ipfs.pubsub.publish(topic, data, [options])`

> Publish a data message to a pubsub topic.

- `topic: String`
- `data: Uint8Array|String` - The message to send

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

### Example

```JavaScript
const topic = 'fruit-of-the-day'
const msg = new TextEncoder().encode('banana')

await ipfs.pubsub.publish(topic, msg)

// msg was broadcasted
console.log(`published to ${topic}`)
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.pubsub.ls([options])`

> Returns the list of subscriptions the peer is subscribed to.

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
| `Promise<string[]>` | An array of topicIDs that the peer is subscribed to |

### Example

```JavaScript
const topics = await ipfs.pubsub.ls()
console.log(topics)
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.pubsub.peers(topic, [options])`

> Returns the peers that are subscribed to one topic.

- `topic: String`

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<string[]>` | An array of peer IDs subscribed to the `topic` |

### Example

```JavaScript
const topic = 'fruit-of-the-day'

const peerIds = await ipfs.pubsub.peers(topic)
console.log(peerIds)
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/pubsub
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
