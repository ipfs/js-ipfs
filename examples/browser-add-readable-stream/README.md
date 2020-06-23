# Using duplex streams to add files to IPFS in the browser

If you have a number of files that you'd like to add to IPFS and end up with a hash representing the directory containing your files, you can invoke [`ipfs.add`](https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/SPEC/FILES.md#add) with an array of objects.

But what if you don't know how many there will be in advance?  You can add multiple files to a directory in IPFS over time by using [`ipfs.addReadableStream`](https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/SPEC/FILES.md#addreadablestream).

## Before you start

First clone this repo, install dependencies in the project root and build the project.

```console
$ git clone https://github.com/ipfs/js-ipfs.git
$ cd js-ipfs
$ npm install
$ npm run build
```

## Running the example

See [`index.js`](./index.js) for a working example and open [`index.html`](./index.html) in your browser to see it run.
