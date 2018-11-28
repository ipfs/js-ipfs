# PubSub API

* [pubsub.subscribe](#pubsubsubscribe)
* [pubsub.unsubscribe](#pubsubunsubscribe)
* [pubsub.publish](#pubsubpublish)
* [pubsub.ls](#pubsubls)
* [pubsub.peers](#pubsubpeers)

#### `pubsub.subscribe`

> Subscribe to a pubsub topic.

##### Go **WIP**

##### JavaScript - `ipfs.pubsub.subscribe(topic, handler, [options], [callback])`

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

##### Go **WIP**

##### JavaScript - `ipfs.pubsub.unsubscribe(topic, handler, [callback])`

- `topic: String` - The topic to unsubscribe from
- `handler: (msg) => {}` - The handler to remove.
- `callback: (Error) => {}` (Optional) Called once the unsubscribe is done.

If no `callback` is passed, a [promise][] is returned.

This works like `EventEmitter.removeListener`, as that only the `handler` passed to a `subscribe` call before is removed from listening. The underlying subscription will only be canceled once all listeners for a topic have been removed.

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

A great source of [examples][] can be found in the tests for this API.

#### `pubsub.publish`

> Publish a data message to a pubsub topic.

##### Go **WIP**

##### JavaScript - `ipfs.pubsub.publish(topic, data, [callback])`

- `topic: String`
- `data: Buffer` - The message to send
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

##### Go **WIP**

##### JavaScript - `ipfs.pubsub.ls([callback])`

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

##### Go **WIP**

##### JavaScript - `ipfs.pubsub.peers(topic, [callback])`

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

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/js/src/pubsub
