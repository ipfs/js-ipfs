# Bundle js-ipfs-api with Browserify!

> In this example, you will find a boilerplate you can use to guide yourself into bundling js-ipfs-api with browserify, so that you can use it in your own web app!

## Setup

As for any js-ipfs-api example, **you need a running IPFS daemon**, you learn how to do that here:

- [Spawn a go-ipfs daemon](https://ipfs.io/docs/getting-started/)
- [Spawn a js-ipfs daemon](https://github.com/ipfs/js-ipfs#usage)

**Note:** If you load your app from a different domain than the one the daemon is running (most probably), you will need to set up CORS, see https://github.com/ipfs/js-ipfs-api#cors to learn how to do that.

A quick (and dirty way to get it done) is:

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

![](https://ipfs.io/ipfs/QmNtpcWCEd6LjdPNfBFDaVZdD4jpgT8ZTAwoFJXKhYMJdo/1.png)
![](https://ipfs.io/ipfs/QmNtpcWCEd6LjdPNfBFDaVZdD4jpgT8ZTAwoFJXKhYMJdo/2.png)
