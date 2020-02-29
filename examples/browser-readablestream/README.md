# Streaming video from IPFS using ReadableStreams

We can use the execllent [`videostream`](https://www.npmjs.com/package/videostream) to stream video from IPFS to the browser.  All we need to do is return a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)-like object that contains the requested byte ranges.

Take a look at [`index.js`](./index.js) to see a working example.

## Running the demo

In this directory:

```
$ npm install
$ npm start
```

Then open [http://localhost:8888](http://localhost:8888) in your browser.
