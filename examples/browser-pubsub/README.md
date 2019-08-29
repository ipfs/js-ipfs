# Pubsub in the browser

> Use pubsub in the browser!

This example is a demo web application that allows you to connect to an IPFS node, subscribe to a pubsub topic and send/receive messages. We'll start two IPFS nodes and two browsers and use the `ipfs-http-client` to instruct each node to listen to a pubsub topic and send/receive pubsub messages to/from each other. We're aiming for something like this:

```
   +-----------+                   +-----------+
   |           +------------------->           |
   |  js-ipfs  |      pubsub       |  go-ipfs  |
   |           <-------------------+           |
   +-----^-----+                   +-----^-----+
         |                               |
         | HTTP API                      | HTTP API
         |                               |
+-------------------+         +-------------------+
+-------------------+         +-------------------+
|                   |         |                   |
|                   |         |                   |
|     Browser 1     |         |     Browser 2     |
|                   |         |                   |
|                   |         |                   |
|                   |         |                   |
+-------------------+         +-------------------+
```

## 1. Get started

With Node.js and git installed, clone the repo and install the project dependencies:

```sh
git clone https://github.com/ipfs/js-ipfs-http-client.git
cd js-ipfs-http-client
npm install # Installs ipfs-http-client dependencies
cd examples/browser-pubsub
npm install # Installs browser-pubsub app dependencies
```

Start the example application:

```sh
npm start
```

You should see something similar to the following in your terminal and the web app should now be available if you navigate to http://127.0.0.1:8888 using your browser:

```sh
Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8888
```

## 2. Start two IPFS nodes

To demonstrate pubsub we need two nodes running so pubsub messages can be passed between them.

Right now the easiest way to do this is to install and start a `js-ipfs` and `go-ipfs` node. There are other ways to do this, see [this document on running multiple nodes](https://github.com/ipfs/js-ipfs/tree/master/examples/running-multiple-nodes) for details.

### Install and start the JS IPFS node

```sh
npm install -g ipfs
jsipfs init
# Configure CORS to allow ipfs-http-client to access this IPFS node
jsipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://127.0.0.1:8888"]'
# Start the IPFS node, enabling pubsub
jsipfs daemon --enable-pubsub-experiment
```

### Install and start the Go IPFS node

Head over to https://dist.ipfs.io/#go-ipfs and hit the "Download go-ipfs" button. Extract the archive and read the instructions to install.

After installation:

```sh
ipfs init
# Configure CORS to allow ipfs-http-client to access this IPFS node
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://127.0.0.1:8888"]'
# Start the IPFS node, enabling pubsub
ipfs daemon --enable-pubsub-experiment
```

## 3. Open two browsers and connect to each node

Now, open up **two** browser windows. This could be two tabs in the same browser or two completely different browsers, it doesn't matter. Navigate to http://127.0.0.1:8888 in both.

In the "API ADDR" field enter `/ip4/127.0.0.1/tcp/5001` in one browser and `/ip4/127.0.0.1/tcp/5002` in the other and hit the "Connect" button.

This connects each browser to an IPFS node and now from the comfort of our browser we can instruct each node to listen to a pubsub topic and send/receive pubsub messages to each other.

> N.B. Since our two IPFS nodes are running on the same network they should have already found each other by MDNS. So you probably won't need to use the "CONNECT TO PEER" field. If you find your pubsub messages aren't getting through, check the output from your `jsipfs daemon` command and find the first address listed in "Swarm listening on" - it'll look like `/ip4/127.0.0.1/tcp/4002/ipfs/Qm...`. Paste this address into the "CONNECT TO PEER" field for the browser that is connected to your go-ipfs node and hit connect.

Finally, use the "SUBSCRIBE TO PUBSUB TOPIC" and "SEND MESSAGE" fields to do some pubsub-ing, you should see messages sent from one browser appear in the log of the other (provided they're both subscribed to the same topic).
