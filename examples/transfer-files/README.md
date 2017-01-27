# Tutorial - Transfer files between the browser and other IPFS nodes

> Welcome! This tutorial will help you build a tiny web application where you can fetch and add files to IPFS and transfer these between a go-ipfs node and a js-ipfs node.

There are a couple of caveats:

- js-ipfs currently doesn't support DHT peer discovery, the peer from which you are fetching data should be within the reach (local or in public IP) of the browser node.
- We need to use a signalling server to establish the WebRTC connections, this won't be necessary as soon as libp2p-relay gets developed
- [full go-ipfs interop is not complete yet, blocked by an interop stream multiplexer](https://github.com/ipfs/js-ipfs/issues/721)

That being said, we will explain throughout this tutorial to circunvent the caveats and once they are fixed, we will update the tutorial as well.

## Application diagram

The goal of this tutorial is to create a application with a IPFS node that dials to other instances of it using WebRTC, and at the same time dial and transfer files from a Desktop IPFS node using WebSockets as the transport.

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

Here's what we are going to be doing, today:

- 1. Set up, install a go-ipfs node in your machine
- 2. Make your daemons listen on WebSockets
- 3. Initialize the project
- 4. Create the frame for your IPFS enabled app
- 5. Add and cat a file
- 6. Use WebRTC to dial between browser nodes
- 7. Dial to a node using WebSockets (your Desktop ones)
- 8. Transfer files between all of your nodes, have fun!

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

```
> ipfs init
```

or

```
> jsipfs init
```

This will set up an `init` file in your home directory.

### 2. Make your daemons listen on WebSockets

At this point, you need to edit your `config` file, the one you just set up with `{js}ipfs init`. It should be in either `~/.jsipfs/config` or `~/.ipfs/config`, depending on whether you're using JS or Go. You can run `cat ~/.jsipfs/config` to see the contents of the JSON file.

Since websockets are currently not stable and are experimental, you'll need to add the ability for your daemon to listen on Websocket addresses. Look into your init file (using `cat`) and find the `Addresses` block:

```json
  "Addresses": {
    "Swarm": [
      "/ip4/0.0.0.0/tcp/4002"
    ],
    "API": "/ip4/127.0.0.1/tcp/5002",
    "Gateway": "/ip4/127.0.0.1/tcp/9090"
  }
```

To make Websockets work, open up the `config` file and add the following entry to your `Swarm` array: `/ip4/0.0.0.0/tcp/9999/ws`. Now, it should look like this: 


```json
  "Addresses": {
    "Swarm": [
      "/ip4/0.0.0.0/tcp/4002",
      "/ip4/0.0.0.0/tcp/9999/ws"
    ],
    "API": "/ip4/127.0.0.1/tcp/5002",
    "Gateway": "/ip4/127.0.0.1/tcp/9090"
  }
```

Now it should listen on Websockets. We're ready to start the daemon.

```sh
> ipfs daemon
```

(Again, either `jsipfs` or `ipfs` works. I'll stop explaining that from here on out.)

You should see the Websocket address in the output:

```sh
Initializing daemon...
Swarm listening on /ip4/127.0.0.1/tcp/4001
Swarm listening on /ip4/127.0.0.1/tcp/9999/ws
Swarm listening on /ip4/192.168.10.38/tcp/4001
Swarm listening on /ip4/192.168.10.38/tcp/9999/ws
API server listening on /ip4/127.0.0.1/tcp/5001
Gateway (readonly) server listening on /ip4/0.0.0.0/tcp/8080
Daemon is ready
```

It's there in line 5 - see the `/ws`? Good. that means it is listening.

### 3. Start the WebApp project


Now, you'll need to make sure you are in `js-ipfs/examples/transfer-files/complete`. You'll see a `package.json`: this manifest holds the information for which packages you'll need to install to run the webapp. Let's install them, and then start the project:

```sh
> npm install
> npm start
```

You should see this text:

```sh
Starting up http-server, serving public
Available on:
  http://127.0.0.1:12345
  http://192.168.1.24:12345
Hit CTRL-C to stop the server
```

Go to http://127.0.0.1:12345 in your browser; you're now in the webapp, if all went well.

### 4. Create the frame for your IPFS enabled app

TODO: Not sure what this means.

### 5. Add and cat a file

### 6. Use WebRTC to dial between browser nodes
### 7. Dial to a node using WebSockets (your Desktop ones)
### 8. Transfer files between all of your nodes, have fun!

--------

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
