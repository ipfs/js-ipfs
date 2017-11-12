# Tutorial - Transfer files between the browser and other IPFS nodes

> Welcome! This tutorial will help you exchange files between browser nodes and go-ipfs nodes.

caveat: js-ipfs currently doesn't support DHT peer discovery, the peer from which you are fetching data should be within the reach (local or in public IP) of the browser node.

That being said, we will explain throughout this tutorial to circunvent the caveats and once they are fixed, we will update the tutorial as well.

## Application diagram

The goal of this tutorial is to create a application with a IPFS node that dials to other instances of it using WebRTC, and at the same time dial and transfer files from a Desktop IPFS node using WebSockets as the transport.

```
┌──────────────┐                ┌──────────────┐
│   Browser    │ libp2p(WebRTC) │   Browser    │
│              │◀──────────────▶│              │
└──────────────┘                └──────────────┘
       ▲                                  ▲
       │WebSockets              WebSockets│
       │        ┌──────────────┐          │
       │        │   Desktop    │          │
       └───────▶│   Terminal   │◀─────────┘
                └──────────────┘
```

## Check out the final state

In the end, you should get an app running, something like this:

![](https://ipfs.io/ipfs/Qmbti2nBZWxQLhpggB7tC3HvcxTMivmMo3MVwQveAsHBAE)

## Step-by-step instructions

Here's what we are going to be doing, today:

- 1. Set up, install a go-ipfs node in your machine
- 2. Make your daemons listen on WebSockets
- 3. Start the WebApp
- 4. Dial to a node using WebSockets (your Desktop ones)
- 5. Transfer files between all of your nodes, have fun!

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

### 2. Make your daemons listen on WebSockets

At this point, you need to edit your `config` file, the one you just set up with `{js}ipfs init`. It should be in either `~/.jsipfs/config` or `~/.ipfs/config`, depending on whether you're using JS or Go.

Note: js-ipfs sets up a websocket listener by default, if you are just using js-ipfs you can skip this test.

Since websockets support is currently not on by default, you'll need to add a WebSockets address manually. Look into your config file and find the `Addresses` section:

```json
"Addresses": {
  "Swarm": [
    "/ip4/0.0.0.0/tcp/4002"
  ],
  "API": "/ip4/127.0.0.1/tcp/5002",
  "Gateway": "/ip4/127.0.0.1/tcp/9090"
}
```

Add the following entry to your `Swarm` array: `/ip4/127.0.0.1/tcp/9999/ws`. Now, it should look like this: 

```json
"Addresses": {
  "Swarm": [
    "/ip4/0.0.0.0/tcp/4002",
    "/ip4/127.0.0.1/tcp/9999/ws"
  ],
  "API": "/ip4/127.0.0.1/tcp/5002",
  "Gateway": "/ip4/127.0.0.1/tcp/9090"
}
```

Now it should listen on Websockets. We're ready to start the daemon.

```sh
> ipfs daemon
```

(Again, either `jsipfs` or `ipfs` works. I'll stop repeting this from here on out.)

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

Now, you'll need to make sure you are in `js-ipfs/examples/exchange-files-in-browser`. You'll see a `package.json`: this manifest holds the information for which packages you'll need to install to run the webapp. Let's install them, and then start the project:

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

### 4. Dial to a node using WebSockets (your Desktop ones)

On your terminal, run `ipfs id` to find the WebSockets address that it is listening on. Should look like this: `"/ip4/127.0.0.1/tcp/4003/ws/ipfs/<your peer id>". Important, your node must be running in order to have listeners, to do so, run in another tab of your terminal: `ipfs daemon`.

![](https://ipfs.io/ipfs/Qme9RM3SSyb57PGA7n5bEhwhMwS8fDrMZ8zzKkrwncRcfm)
![](https://ipfs.io/ipfs/QmdFX4wJkKpryisjGQGt88Yr8zaQM9zMPL3xzK2YGTUMNM)

### 5. Transfer files between all of your nodes, have fun!

Now you can drag an drop files on the browser or add them through the CLI with `ipfs add <file>` and with the fetch file box, you can retrieve the file to the browser or other browser tabs!

![](https://ipfs.io/ipfs/QmcVNbhmMFzz9x2mY33GPGetibFGXXD7dYd3kDa7eKEUyw)
![](https://ipfs.io/ipfs/QmZcRvGQtM7mnSWKqFwptCYoBitBJaGBKLLjvzENfzXFMi)
