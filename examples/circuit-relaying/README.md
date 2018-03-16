# Tutorial - Understanding Circuit Relay

> Welcome! This tutorial will help you understand circuit relay, where it fits in the stack and how to use it.

### So what is a `circuit-relay` and what do we need it for?

In p2p networks there are many cases where two nodes can't talk to each other directly. That may happen because of network topology, i.e. NATs, or execution environments - for example browser nodes can't connect to each other directly because they lack any sort of socket functionality and relaying on specialized rendezvous nodes introduces an undesirable centralization point to the network. A `circuit-relay` is a way to solve this problem - it is a node that allows two other nodes that can't otherwise talk to each other, use a third node, a relay to do so.

#### A word on circuit relay addresses

A circuit relay address is a multiaddress that describes how to either connect to a peer over a relay (or relays), or allow a peer to announce it is reachable over a particular relay or any relay it is already connected to. 

Circuit relay addresses are very flexible and can describe many different aspects of how to esablish the relayed connection. In its simplest form, it looks something like this:

- `/p2p-circuit/ipfs/QmPerr`

If we want to be specific as to which transport we want to use to establish the relay, we can encode that in the address as well:

- `/ip4/127.0.0.1/tcp/65000/ipfs/QmRelay/p2p-circuit/ipfs/QmPeer`

This tells us that we want to use `QmRelay` located at address 127.0.0.1 and port 65000.

- `/ip4/127.0.0.1/tcp/65000/ipfs/QmRelay/p2p-circuit/ip4/127.0.0.1/tcp/8080/ws/ipfs/QmPeer`

We can take it a step further and encode the same information for the destination peer. In this case, we have it located at 127.0.0.1 on port 8080 and using a Web sockets transport!

Other use-cases are also supported by this scheme, i.e. we can have multiple hops (circuit-relay nodes) encoded in the address, something planed for future releases.

## Step-by-step instructions

Here's what we are going to be doing, today:

- 1. Install and configure `go-ipfs` and `js-ipfs` nodes
- 2. Configure and run the js or go ipfs node
- 3. Configure and run the bundled example
- 4. Connect the two browser nodes to the circuit relay
- 5. Dial the two browser nodes using a `/p2p-circuit` address
- 6. Finally, send data from one browser using the bundled example!

> We should end up with something similar to the bellow screenshot after we've gone through all the steps:

![](./img/img7.png)

Let's go.

### 1. Set up

You'll need to have an implementation of IPFS running on your machine. Currently, this means either go-ipfs or js-ipfs.

Installing go-ipfs can be done by installing the binary [here](https://ipfs.io/ipns/dist.ipfs.io/#go-ipfs). Alternatively, you could follow the instructions in the README at [ipfs/go-ipfs](https://github.com/ipfs/go-ipfs).

Installing js-ipfs requires you to have node and [npm](https://www.npmjs.com). Then, you simply run:

```sh
> npm install --global ipfs
...
> jsipfs --help
Commands:
...
```

This will alias `jsipfs` on your machine; this is to avoid issues with `go-ipfs` being called `ipfs`.

At this point, you have either js-ipfs or go-ipfs running. Now, initialize it:

```sh
> ipfs init
# or
> jsipfs init
```

This will set up your IPFS repo in your home directory.

#### Configure and run the js or go ipfs node

We can either use a `go-ipfs` or a `js-ipfs` node as a relay, we'll demonstrate how to set them up in this tutorial and we encourage you to try them both out. That said, either js or go should do the trick for the purpose of this tutorial!

##### Setting up a `go-ipfs` node

In order to enable the relay functionality in `go-ipfs` we need to edit it's configuration file, located under `~/.ipfs/config`:

```js
  "Swarm": {
    "AddrFilters": null,
    "ConnMgr": {
      "GracePeriod": "20s",
      "HighWater": 900,
      "LowWater": 600,
      "Type": "basic"
    },
    "DisableBandwidthMetrics": false,
    "DisableNatPortMap": false,
    "DisableRelay": false,
    "EnableRelayHop": true
  }
```

The two options we're looking for are `DisableRelay` and `EnableRelayHop`. We want the former (`DisableRelay`) set to `false` and the later (`EnableRelayHop`) to `true`, just like in the example above. That should set our go node as a relay. 

We also need to make sure our go node is able to be dialed from the browser, for that we need to enable a transport that both the browser and the go node can communicate over. We will use the web sockets transport, although there are others that can be used, such as `webrtc-star` and `websocket-star`. To enable the transport and set the interface and port we need to edit the `~/.ipfs/config` one more time. Lets find the `Swarm` array and add our desired address there. I picked `/ip4/0.0.0.0/tcp/4004/ws` as it is a port I know is not being used by anything on my machine, but we can also use port `0` so that the OS chooses a random available port for us - either one should work.

```
  "Swarm": [
    "/ip4/0.0.0.0/tcp/4001",
    "/ip4/0.0.0.0/tcp/4004/ws",
    "/ip6/::/tcp/4001"
  ],
```

The config should look similar to the above snippet after we've edited it.

##### Setting up a `js-ipfs` node

We need to go through similar steps to enable circuit relay in `jsipfs`, however the config options are slightly different right now -  that should change once this feature is not marked as experimental, but for now we have to deal with two different sets of options.

Just as we did with `go-ipfs`, go ahead and edit `js-ipfs` config file located under `~/.jsipfs/config`. Lets add the following config:

(Note that the "EXPERIMENTAL" section might be missing from the config file, in that case, just go ahead and add it)

```js
  "EXPERIMENTAL": {
    "relay": {
      "enabled": true,
      "hop": {
        "enabled": true
      }
    }
  }
```

Note that we don't have to do anything to enable the `websocket` transport as it is enabled by default in `jsipfs`.

##### Starting the relay node

We can start the relay nodes by either doing `ipfs daemon` or `jsipfs daemon`:

> go ipfs

```
$ ipfs daemon
Initializing daemon...
Swarm listening on /ip4/127.0.0.1/tcp/4001
Swarm listening on /ip4/192.168.1.132/tcp/4001
Swarm listening on /ip6/::1/tcp/4001
Swarm listening on /p2p-circuit/ipfs/QmY73BLYav2gYc9PCEnjQqbfSGiqFv3aMsRXNyKFGtUoGF
Swarm announcing /ip4/127.0.0.1/tcp/4001
Swarm announcing /ip4/186.4.18.182/tcp/58986
Swarm announcing /ip4/192.168.1.132/tcp/4001
Swarm announcing /ip6/::1/tcp/4001
API server listening on /ip4/127.0.0.1/tcp/5001
Gateway (readonly) server listening on /ip4/127.0.0.1/tcp/8080
Daemon is ready
```

In the case of go ipfs, the crucial `/ipfs/Qm...` part of the multiaddr might be missing, in that case, you can get it by running the `ipfs id` command.

```
$ ipfs id
{
        "ID": "QmY73BLYav2gYc9PCEnjQqbfSGiqFv3aMsRXNyKFGtUoGF",
        "PublicKey": "CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC84qPFzqajCfnvaJunqt48S1LIBRthXV60q5QClL+dUfOOU/m7v1ZcpNhvFFUN6tVCDaoT5AxEv0czxZiVx/njl6FVIc6tE1J+HWpc8cbAXNY6QbbyzKl/rjp7V8/QClE0JqgjIk84wnWGTwFhOEt0hnpu2XFt9iHaenSfg3EAa8K9MlbxmbawuxNLJJf7VZXkJrUNl6WOglAVU8Sqc4QaahCLVK5Dzo98zDBq1KDBxMbUgH0LTqzr6i+saxkEHZmBKO+mMVT3LzOUx1DQR4pLAw1qgoJstsIZEaJ2XLh975IiI7OKqWYH7+3NyNK2sldJK/4Zko4rH3irmnkAxLcFAgMBAAE=",
        "Addresses": [
                "/ip4/127.0.0.1/tcp/4001/ipfs/QmY73BLYav2gYc9PCEnjQqbfSGiqFv3aMsRXNyKFGtUoGF",
                "/ip4/192.168.1.132/tcp/4001/ipfs/QmY73BLYav2gYc9PCEnjQqbfSGiqFv3aMsRXNyKFGtUoGF",
                "/ip6/::1/tcp/4001/ipfs/QmY73BLYav2gYc9PCEnjQqbfSGiqFv3aMsRXNyKFGtUoGF",
                "/ip4/186.4.18.182/tcp/13285/ipfs/QmY73BLYav2gYc9PCEnjQqbfSGiqFv3aMsRXNyKFGtUoGF",
                "/ip4/186.4.18.182/tcp/13285/ipfs/QmY73BLYav2gYc9PCEnjQqbfSGiqFv3aMsRXNyKFGtUoGF"
        ],
        "AgentVersion": "go-ipfs/0.4.14-dev/cb5bb7dd8",
        "ProtocolVersion": "ipfs/0.1.0"
}
```

We can then grab the resolved multiaddr from the `Addresses` array - `/ip4/127.0.0.1/tcp/4004/ws/ipfs/Qm...`. Lets note it down somewhere and move to the next step.

> js ipfs

```
$ jsipfs daemon
Initializing daemon...
Swarm listening on /p2p-circuit/ipfs/QmfQj8YwDdy1uP2DpZBa7k38rSGPvhHiC52cdAGWBqoVpq
Swarm listening on /p2p-circuit/ip4/0.0.0.0/tcp/4002/ipfs/QmfQj8YwDdy1uP2DpZBa7k38rSGPvhHiC52cdAGWBqoVpq
Swarm listening on /p2p-circuit/ip4/127.0.0.1/tcp/4003/ws/ipfs/QmfQj8YwDdy1uP2DpZBa7k38rSGPvhHiC52cdAGWBqoVpq
Swarm listening on /ip4/127.0.0.1/tcp/4003/ws/ipfs/QmfQj8YwDdy1uP2DpZBa7k38rSGPvhHiC52cdAGWBqoVpq
Swarm listening on /ip4/127.0.0.1/tcp/4002/ipfs/QmfQj8YwDdy1uP2DpZBa7k38rSGPvhHiC52cdAGWBqoVpq
Swarm listening on /ip4/192.168.1.132/tcp/4002/ipfs/QmfQj8YwDdy1uP2DpZBa7k38rSGPvhHiC52cdAGWBqoVpq
API is listening on: /ip4/127.0.0.1/tcp/5002
Gateway (readonly) is listening on: /ip4/127.0.0.1/tcp/9090
Daemon is ready
```

Look out for an address similar to `/ip4/127.0.0.1/tcp/4003/ws/ipfs/Qm...` note it down somewhere, and lets move on to the next step. 

### Configure and run the bundled example

Now that we have ipfs installed and initialized, lets set up the included example. This is a standard npm package, so the usual `npm install` should get us going.

```
npm install
```

After it finishes, we should be able to run the project with `npm start` and get a similar output to the bellow one:

```
npm run start
Server running at http://localhost:1234
```

The bundled example is a simple chat app that uses another cool ipfs feature - `pubsub`. Lets open up a browser and paste the above url into the address bar. We should see something similar to the following image:

![](./img/img1.png)

### Connect the two browser nodes to the circuit relay

In order for our browser nodes to be able to send messages to each other, we need to first get them connected, but for that we need to use the relay, remember, browser nodes can't be dialed directly because of lack of socket support, so the relay is here to solve that.

Enter the `/ip4/127.0.0.1/tcp/4003/ws/ipfs/...` address noted above into the `Connect to Peer` field and hit the connect button:

![](./img/img3.png)

After connecting to the IPFS node, we should see the peer show up under the `Peers Connected` box.

![](./img/img4.png)

Now lets repeat the same steps with the second tab. After that, both of our browser nodes should be connected and we can move on to the next step.

### Dial the two browser nodes using a `/p2p-circuit` address

Having both browsers running side by side (as shown in the first screenshot), lets get them connected to each other. Head out to the `Addresses` box in one of the tabs, copy the `/p2p-circuit` address and then paste it into the `Connect to Peer` box in the other tab. Repeat these steps on the second tab.

![](./img/img5.png)

Lets hit the `Connect` button on each of the tabs and we should get the two browsers connected and join the chat room.

![](./img/img6.png)

### Send data browser to browser.

Now that we have the two browsers connected, lets try the app out. Type a few words in one of the browser windows and you should see them appear in the other as well!

![](./img/img7.png)

Thats it!

### Conclusion

Lets recap what we accomplished in this tutorial. We where able to install a js and go ipfs node and configure them as circuit relays, we connected our browsers to the relay and were able to use the bundled chat app to send messages browser to browser.
