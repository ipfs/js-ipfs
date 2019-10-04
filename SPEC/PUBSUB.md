# PubSub API

* [pubsub.subscribe](#pubsubsubscribe)
* [pubsub.unsubscribe](#pubsubunsubscribe)
* [pubsub.publish](#pubsubpublish)
* [pubsub.ls](#pubsubls)
* [pubsub.peers](#pubsubpeers)

#### `pubsub.subscribe`

> Subscribe to a pubsub topic.

##### `ipfs.pubsub.subscribe(topic, handler, [options], [callback])`

- `topic: String`
- `handler: (msg) => {}` - Event handler which will be called with a message object everytime one is received. The `msg` has the format `{from: String, seqno: Buffer, data: Buffer, topicIDs: Array<String>}`.
- `options: Object` - (Optional) Object containing the following properties:
  - `discover: Boolean` - (Default: `false`) Will use the DHT to find other peers.
- `callback: (Error) => {}` - (Optional) Called once the subscription is established.

If no `callback` is passed, a [promise][] is returned.

> _In the future, topic can also be type of TopicDescriptor (https://github.com/libp2p/pubsub-notes/blob/master/flooding/flooding.proto#L23). However, for now, only strings are supported._

**Example:**

```JavaScript
const topic = 'fruit-of-the-day'
const receiveMsg = (msg) => console.log(msg.data.toString())

ipfs.pubsub.subscribe(topic, receiveMsg, (err) => {
  if (err) {
    return console.error(`failed to subscribe to ${topic}`, err)
  }
  console.log(`subscribed to ${topic}`)
})
```

A great source of [examples][] can be found in the tests for this API.

#### `pubsub.unsubscribe`

> Unsubscribes from a pubsub topic.

##### `ipfs.pubsub.unsubscribe(topic, handler, [callback])`

- `topic: String` - The topic to unsubscribe from
- `handler: (msg) => {}` - The handler to remove.
- `callback: (Error) => {}` (Optional) Called once the unsubscribe is done.

If no `callback` is passed, a [promise][] is returned.

If the `topic` and `handler` are provided, the `handler` will no longer receive updates for the `topic`. This behaves like [EventEmitter.removeListener](https://nodejs.org/dist/latest/docs/api/events.html#events_emitter_removelistener_eventname_listener). If the `handler` is not equivalent to the `handler` provided on `subscribe`, no action will be taken.

If **only** the `topic` param is provided, unsubscribe will remove **all** handlers for the `topic`. This behaves like [EventEmitter.removeAllListeners](https://nodejs.org/dist/latest/docs/api/events.html#events_emitter_removealllisteners_eventname). Use this if you would like to no longer receive any updates for the `topic`.

**WARNING:** Unsubscribe is an async operation, but removing **all** handlers for a topic can only be done using the Promises API (due to the difficulty in distinguishing between a "handler" and a "callback" - they are both functions). If you _need_ to know when unsubscribe has completed you must use `await` or `.then` on the return value from 

```JavaScript
ipfs.pubsub.unsubscribe('topic')
```

**Example:**

```JavaScript
const topic = 'fruit-of-the-day'
const receiveMsg = (msg) => console.log(msg.toString())

ipfs.pubsub.subscribe(topic, receiveMsg, (err) => {
  if (err) {
    return console.error(`failed to subscribe to ${topic}`, err)
  }

  console.log(`subscribed to ${topic}`)

  // unsubscribe a second later
  setTimeout(() => {
    ipfs.pubsub.unsubscribe(topic, receiveMsg, (err) => {
      if (err) {
        return console.error(`failed to unsubscribe from ${topic}`, err)
      }

      console.log(`unsubscribed from ${topic}`)
    })
  }, 1000)
})
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

##### `ipfs.pubsub.publish(topic, data, [callback])`

- `topic: String`
- `data: Buffer|String` - The message to send
- `callback: (Error) => {}` - (Optional) Calls back with an error or nothing if the publish was successful.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
const topic = 'fruit-of-the-day'
const msg = Buffer.from('banana')

ipfs.pubsub.publish(topic, msg, (err) => {
  if (err) {
    return console.error(`failed to publish to ${topic}`, err)
  }
  // msg was broadcasted
  console.log(`published to ${topic}`)
})
```

A great source of [examples][] can be found in the tests for this API.

#### `pubsub.ls`

> Returns the list of subscriptions the peer is subscribed to.

##### `ipfs.pubsub.ls([callback])`

- `callback: (Error, Array<string>) => {}` - (Optional) Calls back with an error or a list of topicIDs that this peer is subscribed to.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.pubsub.ls((err, topics) => {
  if (err) {
    return console.error('failed to get list of subscription topics', err)
  }
  console.log(topics)
})
```

A great source of [examples][] can be found in the tests for this API.

#### `pubsub.peers`

> Returns the peers that are subscribed to one topic.

##### `ipfs.pubsub.peers(topic, [callback])`

- `topic: String`
- `callback: (Error, Array<String>) => {}` - (Optional) Calls back with an error or a list of peer IDs subscribed to the `topic`.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
const topic = 'fruit-of-the-day'

ipfs.pubsub.peers(topic, (err, peerIds) => {
  if (err) {
    return console.error(`failed to get peers subscribed to ${topic}`, err)
  }
  console.log(peerIds)
})
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/pubsub
