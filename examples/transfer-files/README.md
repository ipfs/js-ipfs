# access-go-ipfs-files - cat-a-file

**WIP**

## TODO

- Add "connect to peer" input field and "connect" button under the "Peers" section in index.html
- Add `connectToPeer` function which calls `ipfs.swarm.connect(multiaddr)`. See https://github.com/ipfs/js-ipfs/blob/b0a7cd83cbf146b0f147467dedc686f94a5f751f/examples/ipfm/src/DataStore.js#L82 and https://github.com/ipfs/js-ipfs/blob/b0a7cd83cbf146b0f147467dedc686f94a5f751f/examples/ipfm/README.md#start-an-interplanetary-file-exchange-daemon. The multiaddr to connect to looks like this: `/ip4/127.0.0.1/tcp/9999/ws/ipfs/QmZGH8GeASSkSZoNLPEBu1MqtzLTERNUEwh9yTHLEF5kcW`
- Hook up "connect" button's click event to `connectToPeer` function
- Add instructions to this README on how to add a file in go-ipfs
- Add instructions to this README on how to cat it in the UI
- Make sure the "Start a go-ipfs daemon" instructions are correct
- Make sure go-ipfs daemon and the example connect to each other

## Step-by-step Instructions

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
