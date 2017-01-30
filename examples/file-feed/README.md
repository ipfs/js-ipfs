# Example - Exchange files between Desktop and Browser

**WIP**

## Run - TEMP INSTRUCTIONS

1. Run a go-ipfs daemon with a WS address and --enable-pubsub-experiment flag, with API at port 5001
2. Run `node src/ff-cli/bin.js add hello package.json`
3. Change the following line in `src/ff-cli/receive-files.js` to include your go-ipfs daemon WS addres: `node.swarm.connect('/ip4/0.0.0.0/tcp/9999/ws/ipfs/QmZGH8GeASSkSZoNLPEBu1MqtzLTERNUEwh9yTHLEF5kcW', (err, res) => {`
4. Run `node src/ff-cli/bin.js listen hello`
5. It works!

Note that the run order is important, running the ff-cli other way round won't work.

## Coming up

> Welcome! This example will guide you through building a web application for file distribution, using React, OrbitDB (a serverless, distributed database) and libp2p PubSub. You will learn how to distribute content and how to synchronize state in a distributed way.

There are a couple of caveats:

- js-ipfs currently doesn't support DHT peer discovery, the peer from which you are fetching data should be within the reach (local or in public IP) of the browser node.
- We need to use a signalling server to establish the WebRTC connections, this won't be necessary as soon as libp2p-relay gets developed
- [full go-ipfs interop is not complete yet, blocked by an interop stream multiplexer](https://github.com/ipfs/js-ipfs/issues/721). You can, however, fetch content from go-ipfs through js-ipfs.
- This app was created with create-react-app which provides its own build script. The caveat is that it doesn't allow us to use custom webpack config files which we need to shim `zlib` with `browserify-zlib-next`. As a workaround, we copy a custom webpack config file to `node_modules/react-scripts/config/` in a postinstall step.

That being said, we will explain throughout this tutorial to circunvent the caveats and once they are fixed, we will update the tutorial as well.

## Application diagram

```sh
                                                                                      
                                                                                      
       ┌───────────────────────┐                             ┌───────────────────────┐
       │                       │                             │                       │
       │       React UI        │                             │       React UI        │
       │                       │WebRTC Transport             │                       │
       ├───────────────────────┤OrbitDB syncs state of feeds ├───────────────────────┤
       │                       │IPFS distributes the files   │                       │
       │       File Feed       │◀───────────────────────────▶│       File Feed       │
       │                       │                             │                       │
       ├───────────┬───────────┤                             ├───────────┬───────────┤
       │           │           │                             │           │           │
       │  OrbitDB  │   IPFS    │                             │  OrbitDB  │   IPFS    │
       │           │           │                             │           │           │
       └───────────┼───────────┤                             └───────────┼───────────┤
                   │  libp2p   │                                         │  libp2p   │
                   └───────────┘                                         └───────────┘
                   ▲                                                     ▲            
                   │                                                     │            
                   │                                                     │            
                   │                       WebRTC or WebSockets Transport│            
                   │                                                     │            
                   │   ┌───────────────────────┐                         │            
                   │   │                       │                         │            
                   │   │       CLI             │                         │            
                   │   │                       │                         │            
                   │   ├───────────────────────┤                         │            
                   │   │                       │                         │            
                   └──▶│       File Feed       │◀────────────────────────┘            
                       │                       │                                      
                       ├───────────┬───────────┤                                      
                       │           │           │                                      
                       │  OrbitDB  │   IPFS    │                                      
                       │           │           │                                      
                       └───────────┼───────────┤                                      
                                   │  libp2p   │                                      
                                   └───────────┘                                      
```

This app, file exchange, will use OrbitDB, IPFS and libp2p PubSub to synchronize the latest state of a file feed, then using IPFS primitives it fetched and distributes the files. IPFS is using libp2p, the networking stack of IPFS, that enables IPFS to work in the Browser and in Node.js by swapping its building blocks, supporting multiple transports while keeping the same API.

## Quick Start

If you just want to check out the app, go to the complete folder, install the dependencies and run it.

```sh
cd complete
npm install
npm start
# open your browser (Chrome or Firefox) in http://localhost:3000
```

You should get something like this:

`TODO: Insert final screenshot here`


## Step-by-step instructions

### Start a go-ipfs daemon

1. Install go-ipfs from [master](https://github.com/ipfs/go-ipfs#build-from-source).

2. Run `IPFS_PATH=$HOME/.file-exchange ipfs init`

3. Run `IPFS_PATH=$HOME/.file-exchange ipfs config Addresses.Swarm "[\"/ip4/0.0.0.0/tcp/9999/ws\"]" --json`

5. Start the go-ipfs daemon: `IPFS_PATH=$HOME/.file-exchange ipfs daemon --enable-pubsub-experiment`

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

If you see an address like `Swarm listening on /ip4/127.0.0.1/tcp/9999/ws`, it means **all good**!

In a new terminal window, run `IPFS_PATH=$HOME/.file-exchange ipfs id` and note the first address in the `Addresses` field. It should look something like this: `/ip4/127.0.0.1/tcp/9999/ws/ipfs/QmZGH8GeASSkSZoNLPEBu1MqtzLTERNUEwh9yTHLEF5kcW`. **You'll need this address later**.

### Run File Exchange App

**NOTE!**
Before running the following command, you'll need to go to the root directory of `js-ipfs/` and run `npm install` to install all the dependencies. After you've done that, continue with the steps here.

Install the project's dependencies:
```
npm install
```

Start the browser app with:
```
npm start
```

This will open the app in your browser at http://localhost:3000/. Open a file exchange feed by appending the feed name to the url, eg. http://localhost:3000/hello-world.

In the browser app, open the Peers view by clicking on "Searching for peers..." and enter the go-ipfs address you got fom `ipfs id` earlier into the input field and press connect. You should now see that address in the list of peers.

Go back to the terminal and run the file exchange CLI tool:
```
node src/cli/bin add hello-world package.json
```

You should now see `package.json` in the browser app! Click it to view its contents.

**That's it!** 

Play around with the browser app, drag and drop files into it, run `node src/cli/bin` to see what else you can do with the CLI tool and have fun!
