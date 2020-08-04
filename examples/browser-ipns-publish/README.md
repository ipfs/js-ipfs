# Publish to IPNS from the browser

> Use ipns from the browser!

This example is a demo web application that allows you to connect to a go-IPFS node, and publish your IPNS record to the go-DHT network but using your js-ipfs private key. We'll start two IPFS nodes; one in the browser and one on a go-Server. We'll use `ipfs-http-client` to connect to the go-Node to ensure our pubsub messages are getting through, and confirm the IPNS record resolves on the go-Node. We're aiming for something like this:

```
   +-----------+     websocket     +-----------+
   |           +------------------->           |
   |  js-ipfs  |      pubsub       |  go-ipfs  |
   |           <-------------------+           |
   +-----^-----+                   +-----^-----+
         |                               |
         | IPFS in browser               | HTTP API
         |                               |
+-------------------------------------------------+
|                     Browser                     |
+-------------------------------------------------+
|                   |         |                   |
|                   |         |                   |
|  IPFS direct      |         |  js-http-client   |
|  a.k.a. ipfsNode  |         |  a.k.a. ipfsAPI   |
|                   |         |                   |
+-------------------------------------------------+
```

## 1. Get started

With Node.js and git installed, clone the repo and install the project dependencies:

```sh
git clone https://github.com/ipfs/js-ipfs.git
cd examples/browser-ipns-publish
npm install # Installs browser-pubsub app dependencies
```

Start the example application:

```sh
npm start
```

You should see something similar to the following in your terminal and the web app should now be available if you navigate to http://127.0.0.1:1234 using your browser:

```sh
Starting up http-server, serving ./
Available on:
  http://127.0.0.1:1234
```

## 2. Start two IPFS nodes

The first node is the js-ipfs made in the browser and the demo does that for you.

The second is a go-ipfs node on a server. To get our IPNS record to the DHT, we'll need [a server running go-IPFS](https://blog.ipfs.io/22-run-ipfs-on-a-vps/) with the API enabled on port 5001.

Right now the easiest way to do this is to install and start a `go-ipfs` node.

### Install and start the Go IPFS node

Head over to https://dist.ipfs.io/#go-ipfs and hit the "Download go-ipfs" button. Extract the archive and read the instructions to install.

After installation:

```sh
ipfs init
# Configure CORS to allow ipfs-http-client to access this IPFS node
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"*\"]"
# Configure go-ipfs to listen on a websocket address
npx json -I -f ~/.ipfs/config -e "this.Addresses.Swarm.push('/ip4/127.0.0.1/tcp/4003/ws')"
# Start the IPFS node, enabling pubsub and IPNS over pubsub
ipfs daemon --enable-pubsub-experiment --enable-namesys-pubsub
```

## 3. Open the demo in a browser and connect to the go-node

Now, open up the demo in a browser window.

In the "CONNECT TO GO-IPFS VIA API MULTIADDRESS" field enter `/ip4/YourServerIP/tcp/5001` (where `YourSeverIP` is your server's IP address or use `/dns4/yourdomain.com/tcp/5001`) and click connect. Once it connects, put your go-IPFS websocket address in the next field `/dns4/yourdomain.com/tcp/4003/wss/p2p/QmPeerIDHash` and hit the second "Connect" button.

This connects the API to the go-Node and connects your js-IPFS node via websocket to the go-IPFS node so pubsub will work.

You can choose whether to publish this record under the PeerId of the node that is running in the browser ('self') or choose to add a custom key to the IPFS keychain and publish under that instead. Either should work.

Finally, enter `/ipfs/QmSomeHash` as the content you want to publish to IPNS. You should see the messages sent from the browser to the server appear in the logs below, ending with "Success, resolved" if it all worked.
