# FAQ <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->

- [Why isn't there DHT support in js-IPFS?](#why-isnt-there-dht-support-in-js-ipfs)
  - [Node.js](#nodejs)
  - [Browser](#browser)
- [How to enable WebRTC support for js-ipfs in the Browser](#how-to-enable-webrtc-support-for-js-ipfs-in-the-browser)
- [Is there WebRTC support for js-ipfs with Node.js?](#is-there-webrtc-support-for-js-ipfs-with-nodejs)
- [How can I configure an IPFS node to use a custom `signaling endpoint` for my WebRTC transport?](#how-can-i-configure-an-ipfs-node-to-use-a-custom-signaling-endpoint-for-my-webrtc-transport)
- [I see some slowness when hopping between tabs Chrome with IPFS nodes, is there a reason why?](#i-see-some-slowness-when-hopping-between-tabs-chrome-with-ipfs-nodes-is-there-a-reason-why)
- [Can I use IPFS in my Electron App?](#can-i-use-ipfs-in-my-electron-app)
- [What are all these `refs?Qmfoo` HTTP errors I keep seeing in the console?](#what-are-all-these-refsqmfoo-http-errors-i-keep-seeing-in-the-console)
- [Have more questions?](#have-more-questions)

## Why isn't there DHT support in js-IPFS?

There is DHT support for js-IPFS in the form of [libp2p/js-libp2p-kad-dht](https://github.com/libp2p/js-libp2p-kad-dht) but it is not finished yet, and may not be the right solution to the problem.

### Node.js

To enable DHT support, before starting your daemon run:

```console
$ jsipfs config Routing.Type dht
```

The possible values for `Routing.Type` are:

 -  `'none'` the default, this means the DHT is turned off any you must manually dial other nodes
 -  `'dht'` start the node in DHT client mode, if it is discovered to be publicly dialable it will automatically switch to server mode
 -  `'dhtclient'` A DHT client is able to make DHT queries but will not respond to any
 -  `'dhtserver'` A DHT server can make and respond to DHT queries.  Please only choose this option if your node is dialable from the open Internet.

At the time of writing, only DHT client mode is supported and will be selected if `Routing.Type` is not `'none'`.

### Browser

In the browser there are many constraints that mean the environment does not typically make for good DHT participants - the number of connections required is high, people do not tend to stay on a page for long enough to make or answer DHT queries, and even if they did, most nodes on the network talk TCP - the browser can neither open TCP ports on remote hosts nor accept TCP connections.

A better approach may be to set up [Delegate Routing](./DELEGATE_ROUTERS.md) to use remote go-IPFS to make queries on the browsers' behalf as these do not have the same constraints.

Of course, there's no reason why js on the server should not be a fully fledged DHT participant, please help out on the [libp2p/js-libp2p-kad-dht](https://github.com/libp2p/js-libp2p-kad-dht) repo to make this a reality!

## How to enable WebRTC support for js-ipfs in the Browser

To add a WebRTC transport to your js-ipfs node, you must add a WebRTC multiaddr. To do that, simple override the config.Addresses.Swarm array which contains all the multiaddrs which the IPFS node will use. See below:

```JavaScript
const node = await IPFS.create({
  config: {
    Addresses: {
      Swarm: [
        '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
        '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
      ]
    }
  }
})

// your instance with WebRTC is ready
```

**Important:** This transport usage is kind of unstable and several users have experienced crashes. Track development of a solution at https://github.com/ipfs/js-ipfs/issues/1088.

## Is there WebRTC support for js-ipfs with Node.js?

Yes, however, bear in mind that there isn't a 100% stable solution to use WebRTC in Node.js, use it at your own risk. The most tested options are:

- [wrtc](https://npmjs.org/wrtc) - Follow the install instructions.
- [electron-webrtc](https://npmjs.org/electron-webrtc)

To add WebRTC support in a IPFS node instance, do:

```JavaScript
import wrtc from 'wrtc' // or 'electron-webrtc'
import WebRTCStar from 'libp2p-webrtc-star'

const node = await IPFS.create({
  repo: 'your-repo-path',
  config: {
    Addresses: {
      Swarm: [
        "/ip4/0.0.0.0/tcp/4002",
        "/ip4/127.0.0.1/tcp/4003/ws",
        "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
        "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star"
      ]
    }
  },
  libp2p: {
    modules: {
      transport: [WebRTCStar]
    },
    config: {
      peerDiscovery: {
        webRTCStar: { // <- note the lower-case w - see https://github.com/libp2p/js-libp2p/issues/576
          enabled: true
        }
      },
      transport: {
        WebRTCStar: { // <- note the upper-case w- see https://github.com/libp2p/js-libp2p/issues/576
          wrtc
        }
      }
    }
  }
})

// your instance with WebRTC is ready
```

To add WebRTC support to the IPFS daemon, you only need to install one of the WebRTC modules globally:

```bash
npm install wrtc --global
# or
npm install electron-webrtc --global
```

Then, update your IPFS Daemon config to include the multiaddr for this new transport on the `Addresses.Swarm` array. Add: `"/dns4/wrtc-star.discovery.libp2p.io/wss/p2p-webrtc-star"`

## How can I configure an IPFS node to use a custom `signaling endpoint` for my WebRTC transport?

You'll need to execute a compatible `signaling server` ([libp2p-webrtc-star](https://github.com/libp2p/js-libp2p-webrtc-star) works) and include the correct configuration param for your IPFS node:

- provide the [`multiaddr`](https://github.com/multiformats/multiaddr) for the `signaling server`

```JavaScript
const node = await IPFS.create({
  repo: 'your-repo-path',
  config: {
    Addresses: {
      Swarm: [
        '/ip4/127.0.0.1/tcp/9090/ws/p2p-webrtc-star'
      ]
    }
  }
})
```

The code above assumes you are running a local `signaling server` on port `9090`. Provide the correct values accordingly.

## I see some slowness when hopping between tabs Chrome with IPFS nodes, is there a reason why?

Yes, unfortunately, due to [Chrome aggressive resource throttling policy](https://github.com/ipfs/js-ipfs/issues/611), it cuts freezes the execution of any background tab, turning an IPFS node that was running on that webpage into a vegetable state.

A way to mitigate this in Chrome, is to run your IPFS node inside a Service Worker, so that the IPFS instance runs in a background process. You can learn how to install an IPFS node as a service worker in here the repo [ipfs-service-worker](https://github.com/ipfs/ipfs-service-worker)

## Can I use IPFS in my Electron App?

Yes you can and in many ways. Read https://github.com/ipfs/notes/issues/256 for the multiple options.

We now support Electron v5.0.0 without the need to rebuilt native modules.
Still if you run into problems with native modules follow these instructions [here](https://electronjs.org/docs/tutorial/using-native-node-modules).

## What are all these `refs?Qmfoo` HTTP errors I keep seeing in the console?

In order for content added to your node to be accessible to other nodes on the network, they need to be able to [dial](https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/SWARM.md#ipfsswarmconnectaddr-options) your node. This means there needs to be some way of connecting to you from the open Internet.

From node.js and Electron this might be done by opening a TCP port on your router and forwarding traffic to your node, while also configuring an [Announce](https://github.com/ipfs/js-ipfs/blob/master/docs/CONFIG.md#announce) address that is a combination of the forwarded port and your public IP address.

Browsers [can't open TCP sockets](https://github.com/ipfs/js-ipfs/blob/master/docs/BROWSERS.md#limitations-of-the-browser-context) so the only way right now is for your node to be connected to a WebRTC-Star signalling server - nodes interested in your content would connect to the same WebRTC-Star server and use that to negotiate a peer-to-peer connection.

This has several drawbacks - WebRTC is expensive so having lots of peers does not scale well, the maximum packet size is small so it's comparatively inefficient, browsers will frequently cull connections if you switch away from the tab and at the time of writing go-IPFS [has no WebRTC-Star transport](https://libp2p.io/implementations/#transports) so great swathes of the network will not be able to dial your node.

To make your content available, several 'preload' nodes are running. These nodes expose their [refs endpoint](https://docs.ipfs.io/reference/http/api/#api-v0-refs) over HTTP and all js-IPFS nodes connect to them as peers on startup.

When you add content to your node, a request is sent to a preload node with the CID of the content you've just added. This causes the preload node to use [Bitswap](https://docs.ipfs.io/concepts/bitswap/) to pull the content from your node, caching it for an hour or so which then means other nodes can then access the content without having to dial your otherwise undialable node.

These nodes sometimes go down, which is why you see errors in the console. They are non-fatal and can be ignored.

If you run your own node you can [disable preloading](https://github.com/ipfs/js-ipfs/blob/master/docs/MODULE.md#optionspreload) which will make the errors go away, at the cost of your content becoming less available or not available at all.

## Have more questions?

Ask for help in our forum at https://discuss.ipfs.io or in IRC (#ipfs on Freenode).
