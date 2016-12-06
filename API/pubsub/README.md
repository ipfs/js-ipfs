pubsub API
==========

#### `pubsub.subscribe`

> Subscribe to an IPFS Topic

##### `Go` **WIP**

##### `JavaScript` - ipfs.pubsub.subscribe(topic, options, callback)

- `topic` - type: String
- `options` - type: Object, optional, might contain the following properties:
  - `discover`: type: Boolean - Will use the DHT to find 

`callback` must follow `function (err, subscription) {}` where Subscription is a Node.js Stream in Object mode, emiting a `data` event for each new message on the subscribed topic.`err` is an error if the operation was not successful.

`subscription` has a `.cancel` event in order to cancel the subscription.

If no `callback` is passed, a [promise][] is returned.

> _In the future, topic can also be type of TopicDescriptor (https://github.com/libp2p/pubsub-notes/blob/master/flooding/flooding.proto#L23). However, for now, only strings are supported._

#### `pubsub.publish`

> Publish a data message to a pubsub topic

##### `Go` **WIP**

##### `JavaScript` - ipfs.pubsub.publish(topic, data, callback)

- `topic` - type: String
- `data` - type: Buffer

`callback` must follow `function (err) {}` signature, where `err` is an error if the operation was not successful.

If no `callback` is passed, a [promise][] is returned.

#### `pubsub.ls`

> Returns the list of subscriptions the peer is subscribed to.

##### `Go` **WIP**

##### `JavaScript` - ipfs.pubsub.ls(topic, callback)

`callback` must follow `function (err) {}` signature, where `err` is an error if the operation was not successful.

If no `callback` is passed, a [promise][] is returned.

#### `pubsub.peers`

> Returns the peers that are subscribed to one topic.

##### `Go` **WIP**

##### `JavaScript` - ipfs.pubsub.peers(topic, callback)

- `topic` - type: String

`callback` must follow `function (err) {}` signature, where `err` is an error if the operation was not successful.

If no `callback` is passed, a [promise][] is returned.
