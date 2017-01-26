# Tutorial - Transfer files between the browser and other IPFS nodes

> Welcome! This tutorial will help you a tiny web application where you can fetch and add files to IPFS and transfer these between a go-ipfs node and a js-ipfs node.

There are a couple of caveats:

- js-ipfs currently doesn't support DHT peer discovery, the peer from which you are fetching data should be within the reach (local or in public IP) of the browser node.
- We need to use a signalling server to establish the WebRTC connections, this won't be necessary as soon as libp2p-relay gets developed
- [full go-ipfs interop is not complete yet, blocked by an interop stream multiplexer](https://github.com/ipfs/js-ipfs/issues/721)

That being said, we will explain throughout this tutorial to circunvent the caveats and once they are fixed, we will update the tutorial as well.

## Application diagram

The goal of this tutorial is to create a WebApplication with an IPFS node that dials to other instances of it using WebRTC, and at the same time dial and transfer files from a Desktop IPFS node using WebSockets as the transport.

┌──────────────┐                   ┌──────────────┐
│   Browser    │                   │   Browser    │
│              │      WebRTC       │              │
│              │◀─────────────────▶│              │
│              │                   │              │
└──────────────┘                   └──────────────┘
        ▲                                  ▲
        │                                  │
        │                                  │
        │                                  │
        │WebSockets              WebSockets│
        │                                  │
        │                                  │
        │        ┌──────────────┐          │
        │        │   Desktop    │          │
        │        │              │          │
        └───────▶│              │◀─────────┘
                 │              │
                 └──────────────┘

## Check out the final state

If you just want to check out what is the final state of how this application will look like, go to the complete folder, install the dependencies and run it.

```sh
> cd complete
> npm install
> npm start
# open your browser (Chrome or Firefox) in http://localhost:12345
```

You should get something like this:

TODO: Insert final screenshot here

## Step-by-step instructions

**Instructions:**

- 1. Set up, install a go-ipfs and/or js-ipfs in your machine
- 2. Make your daemons listen on WebSockets
- 3. Start the WebApp project
- 4. Create the frame for your IPFS enabled app
- 5. Add and cat a file
- 6. Use WebRTC to dial between browser nodes
- 7. Dial to a node using WebSockets (your Desktop ones)
- 8. Transfer files between all of your nodes, have fun!


-------------------------
> Steps need to be updated once the final thing is finished

### Start a go-ipfs daemon

1. Install go-ipfs from master (TODO: link). 

2. Run `ipfs init`

3. Edit your IPFS config file, located at `~/.ipfs/config`

4. Add a Websocket listener address to `Addresses.Swarm`. It should look like this after editing:
```
"Addresses": {
  "API": "/ip4/127.0.0.1/tcp/5001",
  "Gateway": "/ip4/0.0.0.0/tcp/8080",
  "Swarm": [
    "/ip4/0.0.0.0/tcp/4001",
    "/ip4/0.0.0.0/tcp/9999/ws"
  ]
},
```

5. Start the go-ipfs daemon with:
```
ipfs daemon
```

6. You should see the Websocket address in the output:
```
Initializing daemon...
Swarm listening on /ip4/127.0.0.1/tcp/4001
Swarm listening on /ip4/127.0.0.1/tcp/9999/ws
Swarm listening on /ip4/192.168.10.38/tcp/4001
Swarm listening on /ip4/192.168.10.38/tcp/9999/ws
API server listening on /ip4/127.0.0.1/tcp/5001
Gateway (readonly) server listening on /ip4/0.0.0.0/tcp/8080
Daemon is ready
```

If you see address like `Swarm listening on /ip4/127.0.0.1/tcp/9999/ws`, it means all good!

## Start the example

**NOTE!** Before running the examples, you need to build `js-ipfs`. You can do this by following the instructions in https://github.com/ipfs/js-ipfs#clone-and-install-dependnecies and then building it as per https://github.com/ipfs/js-ipfs#build-a-dist-version.

```
npm install
npm start
```

Open http://127.0.0.1:8080 in a browser.

**TODO: add instructions how to cat a hash in the UI.**

## Tutorial

Steps
1. create IPFS instance

TODO. See `./start-ipfs.js`

3. add a file in go-ipfs
4. copy file's hash
5. ipfs.files.cat

TODO. add ipfs.files.cat code examples from index.html

6. output the buffer to <img>

```
...
stream.on('end', () => {
  const blob = new Blob(buf)
  picture.src = URL.createObjectURL(blob)
})
```
