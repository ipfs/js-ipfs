# Robust Initialization and libp2p-webrtc-star Signaling

There's still a bit of work required to start up an in-browser node in a robust way, so that it will work whether or not there is an existing initialized IPFS repo in the user's browser. If there isn't one, you need to call `init` as above, but if there is one, calling `init` will fail. Moreover, there's currently no good way to check if you need to call `init` or not.

Also, an in-browser node isn't able to call up normal IPFS nodes over raw TCP; it can only communicate over Websockets and WebRTC. Currently, there are no Websockets or WebRTC bootstrap nodes run by the IPFS maintainers. You will probably want to set up a [libp2p-webrtc-star signaling server](https://github.com/libp2p/js-libp2p-webrtc-star) so nodes used in your application can find each other:

```bash
npm i libp2p-webrtc-star -g
star-sig
```

You will then want to point IPFS nodes used in your application at your signaling server, so they can connect to each other. This is accomplished by adding an address to the node's configuration referencing the signaling server, of the form `/libp2p-webrtc-star/ip4/<server-ip>/tcp/<server-port>/ws/ipfs/<peer-id>`, where `<peer-id>` is the peer ID of the node that the address is being added to. This causes the node to think of itself as being contactable through the signaling server. It will then initializes its libp2p-webrtc-star implementation and automatically peer with other nodes using the same server.

The `index.html` page in this directory is an example which initializes an IPFS node in a browser safely, whether a node has already been initialized by the current domain or not. It also configures `libp2p-webrtc-star` communication, using a signaling server running on the local host. (Note that since IPFS node configuration information is stored in IndexedDB in browsers, opening two tabs of this code from a local file in the same browser won't work, because they'll share the same node keys and identity. Either run the code from multiple domains, or run it in two different browsers, like Chrome and Firefox.)
