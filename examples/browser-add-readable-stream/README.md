# Using duplex streams to add files to IPFS in the browser

If you have a number of files that you'd like to add to IPFS and end up with a hash representing the directory containing your files, you can invoke [`ipfs.files.add`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add) with an array of objects.

But what if you don't know how many there will be in advance?  You can add multiple files to a directory in IPFS over time by using [`ipfs.files.addReadableStream`](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#addreadablestream).

See `index.js` for a working example and open `index.html` in your browser to see it run.
