# Bundle js-ipfs with [Parcel.js](https://parceljs.org/)

> In this example, you will find a boilerplate application that connects to
IPFS using JS-IPFS and is bundled with [Parcel.js](https://parceljs.org/), so
that you can follow it for creating Parcel.js bundled js-ipfs DApps.

## Before you start

First clone this repo, install dependencies in the project root and build the project.

```console
$ git clone https://github.com/ipfs/js-ipfs.git
$ cd js-ipfs
$ npm install
$ npm run build
```

## Running the example

1. Start your IPFS daemon of choice e.g. `ipfs daemon` (optional if you do not
want to serve the example over IPFS)
1. Open a new terminal
1. `cd` into this folder

## Running this example in development mode with auto-reloading

1. `npm start`
1. Open your browser at `http://localhost:1234`

You should see the following:

![](https://ipfs.io/ipfs/QmSiZ18GffagbbJ3z72kK7u3SP9MXqBB1vrU1KFYP3GMYs/1.png)

## Build and add to IPFS

1. Clear the contents of `dist` if this is not the first time you are building
e.g. `rm -r dist` on a unix system
1. `npm run build`
1. The production build of the site is now in the `dist` folder
1. Add the folder to ipfs using your IPFS client of choice e.g.
`ipfs add -r dist`

The last hash output is the hash of the directory.  This can be used to access
this example served over IPFS and will be accessible by a public gateway:

> https://ipfs.io/ipfs/<hash_of_directory>/


