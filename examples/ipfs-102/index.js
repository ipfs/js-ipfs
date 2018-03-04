'use strict'

const series = require('async/series');
const IPFS = require('ipfs');
const IPFSRepo = require('ipfs-repo');

// Use different repos every time (to make testing easier).
const repo1 = new IPFSRepo('/tmp/ipfs-repo-' + new Date().getTime());
const repo2 = new IPFSRepo('/tmp/ipfs-repo-' + new Date().getTime());

var node1;
var node2;
var fileMultihash;

series([
  // [1] Create the first node.
  (cb) => {
    node1 = new IPFS({
      repo: repo1,
      init: true, // default
      start: true, // default
      EXPERIMENTAL: {
      },
      config: { // overload the default IPFS node config, find defaults at https://github.com/ipfs/js-ipfs/tree/master/src/core/runtime
        Addresses: {
          Swarm: [
            '/ip4/127.0.0.1/tcp/5001'
          ]
        }
      },
    });
    console.log('IPFS node 1 created.');
    return cb();
  },
  (cb) => node1.on('ready', () => {
    console.log('IPFS node 1 ready.');
    return cb();
  }),
  (cb) => node1.on('start', () => {
    console.log('IPFS node 1 started.');
    return cb();
  }),

  // [2] Add a file to IPFS network from the first node.
  (cb) => {
    let buffer = Buffer.from('Hello World 102');
    // console.log('\nBuffer = ' + buffer);
    node1.files.add(buffer, {}, (err, filesAdded) => {
      if (err) { return cb(err) }
      let path = filesAdded[0].path;
      fileMultihash = filesAdded[0].hash;
      console.log('\nFile added from node 1:');
      console.log(`path = ${path}`);
      console.log(`fileMultihash = ${fileMultihash}\n`);
      return cb();
    })
  },

  // [3] Create the second node.
  (cb) => {
    node2 = new IPFS({
      repo: repo2,
      init: true,
      start: true,
      EXPERIMENTAL: {
      },
      config: {
        Addresses: {
          Swarm: [
            '/ip4/127.0.0.1/tcp/5002'
          ]
        }
      },
    });
    console.log('IPFS node 2 created.');
    return cb();
  },
  (cb) => node2.on('ready', () => {
    console.log('IPFS node 2 ready.');
    return cb();
  }),
  (cb) => node2.on('start', () => {
    console.log('IPFS node 2 started.');
    return cb();
  }),

  // [4] Retrieve the file on the IPFS network from the second node.
  (cb) => node2.files.cat(fileMultihash, (err, data) => {
    if (err) { return cb(err) }
    console.log('\nFile read from node 2:');
    process.stdout.write(data + '\n\n');
    return cb();
  }),

  // [5] Stop all IPFS instances.
  (cb) => node1.stop((err) => {
    if (err) { return cb(err) }
    console.log('IPFS node 1 stopped.');
    return cb();
  }),
  (cb) => node2.stop((err) => {
    if (err) { return cb(err) }
    console.log('IPFS node 2 stopped.');
    return cb();
  }),
],
  (error) => {
    if (error) {
      console.log(error);
    }
  }
)
