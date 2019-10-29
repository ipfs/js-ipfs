# PubSub API

* [pubsub.subscribe](#pubsubsubscribe)
* [pubsub.unsubscribe](#pubsubunsubscribe)
* [pubsub.publish](#pubsubpublish)
* [pubsub.ls](#pubsubls)
* [pubsub.peers](#pubsubpeers)

### ⚠️ Note
Although not listed in the documentation, all the following APIs that actually return a **promise** can also accept a **final callback** parameter.

#### `pubsub.subscribe`

> Subscribe to a pubsub topic.

##### `ipfs.pubsub.subscribe(topic, handler, [options])`

- `topic: String`
- `handler: (msg) => {}` - Event handler which will be called with a message object everytime one is received. The `msg` has the format `{from: String, seqno: Buffer, data: Buffer, topicIDs: Array<String>}`.
- `options: Object` - (Optional) Object containing the following properties:
  - `discover: Boolean` - (Default: `false`) Will use the DHT to find other peers. ***Note:** This option is currently unimplemented and, thus, you can't use it for now.*

> _In the future, topic can also be type of TopicDescriptor (https://github.com/libp2p/pubsub-notes/blob/master/flooding/flooding.proto#L23). However, for now, only strings are supported._

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

```JavaScript
const topic = 'fruit-of-the-day'
const receiveMsg = (msg) => console.log(msg.data.toString())

await ipfs.pubsub.subscribe(topic, receiveMsg)
console.log(`subscribed to ${topic}`)
```

A great source of [examples][] can be found in the tests for this API.

#### `pubsub.unsubscribe`

> Unsubscribes from a pubsub topic.

##### `ipfs.pubsub.unsubscribe(topic, handler)`

- `topic: String` - The topic to unsubscribe from
- `handler: (msg) => {}` - The handler to remove.

If the `topic` and `handler` are provided, the `handler` will no longer receive updates for the `topic`. This behaves like [EventEmitter.removeListener](https://nodejs.org/dist/latest/docs/api/events.html#events_emitter_removelistener_eventname_listener). If the `handler` is not equivalent to the `handler` provided on `subscribe`, no action will be taken.

If **only** the `topic` param is provided, unsubscribe will remove **all** handlers for the `topic`. This behaves like [EventEmitter.removeAllListeners](https://nodejs.org/dist/latest/docs/api/events.html#events_emitter_removealllisteners_eventname). Use this if you would like to no longer receive any updates for the `topic`.

**WARNING:** Unsubscribe is an async operation, but removing **all** handlers for a topic can only be done using the Promises API (due to the difficulty in distinguishing between a "handler" and a "callback" - they are both functions). If you _need_ to know when unsubscribe has completed you must use `await` or `.then` on the return value from

```JavaScript
ipfs.pubsub.unsubscribe('topic')
```

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

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

#### `pubsub.publish`

> Publish a data message to a pubsub topic.

##### `ipfs.pubsub.publish(topic, data)`

- `topic: String`
- `data: Buffer|String` - The message to send

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

```JavaScript
const topic = 'fruit-of-the-day'
const msg = Buffer.from('banana')

await ipfs.pubsub.publish(topic, msg)

// msg was broadcasted
console.log(`published to ${topic}`)
```

A great source of [examples][] can be found in the tests for this API.

#### `pubsub.ls`

> Returns the list of subscriptions the peer is subscribed to.

##### `ipfs.pubsub.ls()`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array of topicIDs that the peer is subscribed to |

**Example:**

```JavaScript
const topics = await ipfs.pubsub.ls()
console.log(topics)
```

A great source of [examples][] can be found in the tests for this API.

#### `pubsub.peers`

> Returns the peers that are subscribed to one topic.

##### `ipfs.pubsub.peers(topic)`

- `topic: String`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array of peer IDs subscribed to the `topic` |

**Example:**

```JavaScript
const topic = 'fruit-of-the-day'

const peerIds = ipfs.pubsub.peers(topic)
console.log(peerIds)
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/pubsub
