Resolve through IPLD graphs with the dag API
============================================

IPLD stands for [`InterPlanetary Linked-Data`](https://ipld.io/), it is the data model of the content-addressable web. It gives IPFS the ability to resolve through any kind of content-addressed graph, as long as the [adapter for the format is available](https://github.com/ipld/interface-ipld-format#modules-that-implement-the-interface).

This tutorial goes through several operations over IPLD graphs using the [DAG API](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag).

## [create nodes to build a graph](./put.js)

## [retrieve a node from a graph](./get.js)

## [resolve a path in a graph](./get-path.js)

## [resolve through graphs of different kind](./get-path-accross-formats.js)

## [explore a graph with the .tree](./tree.js)

## [traverse through a slice of the ethereum blockchain](./eth.js)

## [traverse through a git repo](./git.js)

## Video of the demos

Find a video with a walkthrough of this examples on Youtube:

[![](https://ipfs.io/ipfs/QmYkeiPtVTR8TdgBNa4u46RvjfnbUFUxSDdb8BqDpqDEer)](https://youtu.be/drULwJ_ZDRQ?t=1m29s)
