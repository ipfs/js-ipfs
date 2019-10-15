Using JS IPFS in The Browser
----------------------------

JS IPFS is the implementation of IPFS protocol in JavaScript. It can run on any
evergreen browser, inside a service or web worker, as a web extention and in Node.js.

The documentation details more information about running JS IPFS in the browser and
boosting the speed with reducing the errors you face often because of limitation of
js-ipfs.

There are few different components for implementing JS IPFS in the browser. These
are webrtc and websocket-star which will make it easier for implemented JS IPFS
in the browser and boost the speed and reduce the errors.

You can find the information present for enabling webRTC support for js-ipfs in
the browser [here](https://github.com/ipfs/js-ipfs#how-to-enable-webrtc-support-for-js-ipfs-in-the-browser) and a different one is
implementing with webrtc-star, you can find information [here](https://github.com/ipfs/js-ipfs#is-there-a-more-stable-alternative-to-webrtc-star-that-offers-a-similar-functionality).

You can find information about running IPFS in the broswer [here](https://github.com/ipfs/js-ipfs#table-of-contents).

Getting Data From IPFS
-----------------------

Using Javascript in the browser

```js
const node = new IPFS()

node.once('ready', () => {
  node.pipe('QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A', (err, data) => {
    if (err) return console.error(err)

    // convert Buffer back to string
    console.log(data.toString())
  })
})
```

JS IPFS Restriction in Web Browser
------------------------------------------

- DHT in js-ipfs is not enabled by default.

  In browser a JS IPFS node is more restricted because of the same origin policy
  that decrease the discover/connect with peers, external peers without rendezvous
  and relay servers, delegating peer/content routing and preload servers for content
  discoverablilty hard and erroneous even with swarm peers.

- If the browser lacks TCP, you can set up delegating routing. The issue might still
  persist for connecting most of peers in the swarm as described above.

- Connection with websocket ports should be adhering with [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) limitations.

JS IPFS Best Practices
----------------------

- Configure nodes for using webrtc or websocket-star.
- Run independant instance as default one are under high load and YMMV.
- Make sure content you are implementing is cached in go-ipfs
  - manually `pin` or preload CIDs of interest with `refs -r` beforehand.
  - preload content on the fly using [preload](https://github.com/ipfs/js-ipfs#optionspreload) or
    configuring [delgated routing](https://github.com/ipfs/js-ipfs#configuring-delegate-routers).
    Here you will be using go-ipfs's API + nginx.

JS IPFS Examples
----------------

We have documented a lot of examples for implemented JS IPFS in the browser, you
can find them [here](https://github.com/ipfs/js-ipfs-http-client/tree/master/examples).
