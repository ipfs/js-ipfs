# JS IPFS API - Example Browser - Name

## Setup

```sh
npm install -g ipfs
jsipfs init
# Configure CORS to allow ipfs-http-client to access this IPFS node
jsipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://127.0.0.1:8888"]'
# Start the IPFS node
jsipfs daemon
```

Then in this folder run

```bash
> npm install
> npm start
```

and open your browser at `http://127.0.0.1:8888`.
