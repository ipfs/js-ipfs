# Bundle js-ipfs-http-client with Webpack!

> In this example, you will find a boilerplate you can use to guide yourself into bundling js-ipfs-http-client with webpack, so that you can use it in your own web app!

## Setup

As for any js-ipfs-http-client example, **you need a running IPFS daemon**, you learn how to do that here:

- [Spawn a go-ipfs daemon](https://ipfs.io/docs/getting-started/)
- [Spawn a js-ipfs daemon](https://github.com/ipfs/js-ipfs#usage)

**Note:** If you load your app from a different domain than the one the daemon is running (most probably), you will need to set up CORS, see https://github.com/ipfs/js-ipfs-http-client#cors to learn how to do that.

A quick (and dirty) way to get it done is:

```bash
> ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"*\"]"
> ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[\"true\"]"
```

## Run this example

Once the daemon is on, run the following commands within this folder:

```bash
> npm install
> npm start
```

Now open your browser at `http://localhost:8888`

You should see the following:

![](https://ipfs.io/ipfs/QmZndNLRct3co7h1yVB72S4qfwAwbq7DQghCpWpVQ45jSi/1.png)

