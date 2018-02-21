pubsub API
==========

#### `pubsub.subscribe`

> Subscribe to a pubsub topic.

##### `Go` **WIP**

##### `JavaScript` - ipfs.pubsub.subscribe(topic, options, handler, callback)

- `topic: string`
- `options: Object` - (Optional), might contain the following properties:
  - `discover`: type: Boolean - Will use the DHT to find other peers.
- `handler: (msg) => ()` - Event handler which will be called with a message object everytime one is received. The `msg` has the format `{from: string, seqno: Buffer, data: Buffer, topicIDs: Array<string>}`.
- `callback: (Error) => ()` (Optional) Called once the subscription is established.

If no `callback` is passed, a [promise][] is returned.

> _In the future, topic can also be type of TopicDescriptor (https://github.com/libp2p/pubsub-notes/blob/master/flooding/flooding.proto#L23). However, for now, only strings are supported._

**Example:**

```JavaScript
const topic = 'fruit-of-the-day'

const receiveMsg = (msg) => {
  console.log(msg.data.toString())
}

ipfs.pubsub.subscribe(topic, receiveMsg)
```

A great source of [examples][] can be found in the tests for this API.

#### `pubsub.unsubscribe`

> Unsubscribes from a pubsub topic.

##### `Go` **WIP**

##### `JavaScript` - `ipfs.pubsub.unsubscribe(topic, handler)`

- `topic: string` - The topic to unsubscribe from
- `handler: (msg) => ()` - The handler to remove.

This works like `EventEmitter.removeListener`, as that only the `handler` passed to a `subscribe` call before is removed from listening. The underlying subscription will only be canceled once all listeners for a topic have been removed.

**Example:**

```JavaScript
const topic = 'fruit-of-the-day'

const receiveMsg = (msg) => {
  console.log(msg.toString())
}

ipfs.pubsub.subscribe(topic, receiveMsg)

setTimeout(() => {
  // unsubscribe a second later
  ipfs.pubsub.unsubscribe(topic, receiveMsg)
}, 1000)
```

A great source of [examples][] can be found in the tests for this API.

#### `pubsub.publish`

> Publish a data message to a pubsub topic.

##### `Go` **WIP**

##### `JavaScript` - ipfs.pubsub.publish(topic, data, callback)

- `topic: string`
- `data: buffer` - The actual message to send
- `callback: (Error) => ()` - Calls back with an error or nothing if the publish was successfull.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
const topic = 'fruit-of-the-day'
const msg = new Buffer('banana')

ipfs.pubsub.publish(topic, msg, (err) => {
  if (err) {
    throw err
  }
  // msg was broadcasted
})
```

A great source of [examples][] can be found in the tests for this API.

#### `pubsub.ls`

> Returns the list of subscriptions the peer is subscribed to.

##### `Go` **WIP**

##### `JavaScript` - ipfs.pubsub.ls(callback)

- `callback: (Error, Array<string>>) => ()` - Calls back with an error or a list of topicCIDs that this peer is subscribed to.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.pubsub.ls((err, topics) => {
  if (err) {
    throw err
  }
  console.log(topics)
})
```

A great source of [examples][] can be found in the tests for this API.

#### `pubsub.peers`

> Returns the peers that are subscribed to one topic.

##### `Go` **WIP**

##### `JavaScript` - ipfs.pubsub.peers(topic, callback)

- `topic: string`
- `callback: (Error, Array<string>>) => ()` - Calls back with an error or a list of peer ids subscribed to the `topic`.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.pubsub.peers(topic, (err, peerIds) => {
  if (err) {
    throw err
  }
  console.log(peerIds)
})
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/js/src/pubsub.js
