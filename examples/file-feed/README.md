# Tutorial - Synchronize and distribute folders with files.

> Welcome! This tutorial will guide you through building a web application for file distribution, using React, OrbitDB (a distributed key-value store) and libp2p PubSub. You will learn how to distribute content and how to synchronize state in a distributed way.

There are a couple of caveats:

- js-ipfs currently doesn't support DHT peer discovery, the peer from which you are fetching data should be within the reach (local or in public IP) of the browser node.
- We need to use a signalling server to establish the WebRTC connections, this won't be necessary as soon as libp2p-relay gets developed
- [full go-ipfs interop is not complete yet, blocked by an interop stream multiplexer](https://github.com/ipfs/js-ipfs/issues/721). You can, however, fetch content from go-ipfs through js-ipfs.

That being said, we will explain throughout this tutorial to circunvent the caveats and once they are fixed, we will update the tutorial as well.

# Application diagram

`TODO - Explain in a diagram how things fit with each other`

## Check out the final state

If you just want to check out what is the final state of how this application will look like, go to the complete folder, install the dependencies and run it.

```sh
> cd complete
> npm install
> npm start
# open your browser (Chrome or Firefox) in http://localhost:12345
```

You should get something like this:

`TODO: Insert final screenshot here`

## Step-by-step instructions

`TODO`

--------------------------------------
`needs refactor`
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

### Start an InterPlanetary File Exchange daemon

1. Install the project's dependencies:
```
npm install
```

2. Start the browser app with:
```
npm start
```

This will open the app in your browser at http://localhost:3000/.

3. In the browser app, open a file exchange feed url, eg. http://localhost:3000/hello-world.

4. Start the Node.js ipfe-daemon with:
```
node ipfe-daemon hello-world
```

The first argument after `ipfe-daemon` is the name of the file exchange feed.

5. In the browser app, open the Peers view by clicking on "Searching for peers..." or "1 peer". You will see which peers you're connected to.

6. Now go back to the terminal and find the Websocket multiaddress of your go-ipfs daemon by running:
```
ipfs id
```

This will output all the address your go-ipfs daemon is listening at. Find the one with `ws` in it, and the port you added to the go-ipfs configuration file. It looks something like this:
```
/ip4/127.0.0.1/tcp/9999/ws/ipfs/QmZGH8GeASSkSZoNLPEBu1MqtzLTERNUEwh9yTHLEF5kcW
```

7. Copy the address and paste it into the "Connect" input field in the browser app and press "Connect".

8. You should now see the two IPFS instances connected. You can verify it by observing the Peer view in the browser app and running the following command in the terminal:
```
ipfs swarm peers
```

### Add files to InterPlanetary File Exchange

1. Add a file by running:
```
node ipfe-add hello-world ipfe-add.js
```

You should see the following output:
```
Starting...
Swarm listening on /libp2p-webrtc-star/ip4/127.0.0.1/tcp/9090/ws/ipfs/QmYRSN9BdRU5oYM1ryAWF518ogv8SkwZyux4aEWpxoaYZA
IPFS node is ready
New peers for 'hello-world':
QmRNhXuS78LtUVLdJUJKmeLfE7K64CGBmwCiXY1sgJ6NaV
------------------------------
File | Hash | Size | Mime Type
------------------------------
ipfe-add.js | Qmdp8yhkyNGeqEYpkpqAm7duYqsEiJUi3KXfUFuUcyR2GR | 2588 | application/javascript
```

Note that the multihash at the end of the swarm address will be different.

6. Once you see the output above, it means the file was added successfully!

7. Now go back to the browser app and observe the file in the list of files.

8. Click the file to open it.

9. You have successfully added a file in go-ipfs and downloaded it to the browser.

You can also add files to the browser app by dragging and dropping them. Once you do so, you should see the updated file list in the terminal running `ipfe-daemon`.
