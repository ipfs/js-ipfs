# Use IPFS in the browser with `<script>` tags

You can use IPFS in your in-browser JavaScript code with just a `<script>` tag.

```html
<script src="https://cdn.jsdelivr.net/npm/ipfs/dist/index.min.js"></script>
```

This exposes a global `Ipfs`; you can get a node by making a `new Ipfs()`.

## Before you start

First clone this repo, install dependencies in the project root and build the project.

```console
$ git clone https://github.com/ipfs/js-ipfs.git
$ cd js-ipfs
$ npm install
$ npm run build
```

## Running the example

See `index.html` for a working example.
