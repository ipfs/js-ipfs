# Using JS IPFS in the Browser

JS IPFS is the implementation of IPFS protocol in JavaScript. It can run on any
evergreen browser, inside a service or web worker, browser extensions, Electron and in Node.js.

**This document provides key information about running JS IPFS in the browser.
Save time and get familiar with common caveats and limitations of the browser context.**

## Limitations of the Browser Context

- Transport options are limited to [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) and [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API).

  This means JS IPFS running in the browser is limited to Web APIs available on a web page.
  There is no access to raw TCP sockets nor low level UDP, only WebSockets and WebRTC.

- Key [Web APIs](https://developer.mozilla.org/en-US/docs/Web/API) require or are restricted by [Secure Context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) policies.

  This means JS IPFS needs to run within Secure Context (HTTPS or localhost).
  JS IPFS running on HTTPS website requires Secure WebSockets (TLS) and won't work with unencrypted one.
  [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) not being available at all.

- [DHT](https://en.wikipedia.org/wiki/Distributed_hash_table) is not available in JS IPFS yet.

  [We are working on it](https://github.com/ipfs/js-ipfs/pull/1994). For now, the discovery and connectivity to other peers is achieved with a mix of rendezvous and
  relay servers, delegated peer/content routing and preload servers.


## Addressing Limitations

We provide a few additional components useful for running JS IPFS in the browser:

- [libp2p-websocket-star](https://github.com/libp2p/js-libp2p-websocket-star/) - incorporates both a transport and a discovery service that is facilitated by the custom rendezvous server available in the repo.
  - Instructions on enabling `websocket-star` in js-ipfs config can be found [here](https://github.com/ipfs/js-ipfs#is-there-a-more-stable-alternative-to-webrtc-star-that-offers-a-similar-functionality).
  - Make sure to [run your own rendezvous server](https://github.com/libp2p/js-libp2p-websocket-star/#usage-1).
- [libp2p-webrtc-star](https://github.com/libp2p/js-libp2p-webrtc-star) - incorporates both a transport and a discovery service that is facilitated by the custom rendezvous server available in the repo
  - Instructions on enabling `webrtc-star` in js-ipfs config can be found [here](https://github.com/ipfs/js-ipfs#how-to-enable-webrtc-support-for-js-ipfs-in-the-browser).
  - Make sure to [run your own rendezvous server](https://github.com/libp2p/js-libp2p-webrtc-star#rendezvous-server-aka-signalling-server).
- [libp2p-webrtc-direct](https://github.com/libp2p/js-libp2p-webrtc-direct) - a WebRTC transport that doesn't require the set up a signalling server.
  - Caveat: you can only establish Browser to Node.js and Node.js to Node.js connections.

**Note:** those are semi-centralized solutions. We are working towards replacing `*-star` with and ambient relays and [libp2p-rendezvous](https://github.com/libp2p/js-libp2p-rendezvous). Details and progress can be found [here](https://github.com/libp2p/js-libp2p/issues/385).

You can find detailed information about running js-ipfs [here](https://github.com/ipfs/js-ipfs#table-of-contents).

## Best Practices

- Configure nodes for using self-hosted `*-star` signaling and transport service.  When in doubt, use WebSockets ones.
- Run your own instance of `*-star` signaling service.
  The default ones are under high load and should be used only for tests and development.
- Make sure content added to js-ipfs running in the browser is persisted/cached somewhere on regular IPFS daemon
  - Manually `pin` or preload CIDs of interest with `refs -r` beforehand.
  - Preload content on the fly using [preload](https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs/docs/MODULE.md#optionspreload) feature and/or
    configure [delegated routing](https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs/docs/DELEGATE_ROUTERS.md).
    - Avoid public instances in production environment. Make sure preload and delegate nodes used in config are self-hosted and under your control (expose a subset of go-ipfs APIs via reverse proxy such as Nginx).

## Code Examples

Prebuilt bundles are available, using JS IPFS in the browser is as simple as:

```js
<script src="https://cdn.jsdelivr.net/npm/ipfs/dist/index.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', async () => {
  const node = await Ipfs.create()
  const results = await node.add('=^.^= meow meow')
  const cid = results[0].hash
  console.log('CID created via ipfs.add:', cid)
  const data = await node.cat(cid)
  console.log('Data read back via ipfs.cat:', new TextDecoder().decode(data))
})
</script>
```

More advanced examples and tutorials can be found in the [examples](../examples)
