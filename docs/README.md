# IPFS Docs <!-- omit in toc -->

- [API Docs](#api-docs)
- [How tos and other documentation](#how-tos-and-other-documentation)
- [Development documentation](#development-documentation)

## API Docs

`ipfs` can run as part of your program (an in-process node) or as a standalone daemon process that can be communicated with via an HTTP RPC API using the [`ipfs-http-client`](../packages/ipfs-http-client) module.

Whether accessed directly or over HTTP, both methods support the full [Core API](#core-api).  In addition other methods are available to construct instances of each module, etc.

* [Core API docs](./core-api/README.md)
* [IPFS API](../packages/ipfs/README.md)
* [IPFS-HTTP-CLIENT API](../packages/ipfs-http-client/README.md)

## How tos and other documentation

* [Architecture overview](./ARCHITECTURE.md)
* [How to run js-IPFS in the browser](./BROWSERS.md)
* [Running js-IPFS on the CLI](./CLI.md)
* [js-IPFS configuration options](./CONFIG.md)
* [How to configure CORS for use with the http client](./CORS.md)
* [Running js-IPFS as a daemon](./DAEMON.md)
* [Configuring Delegate Routers](./DELEGATE_ROUTERS.md)
* [Running js-IPFS under Docker](./DOCKER.md)
* [FAQ](./FAQ.md)
* [How to configure additional IPLD codecs](./IPLD.md)
* [Running js-IPFS in your application](./MODULE.md)
* [How to get metrics out of js-IPFS](./MONITORING.md)

## Development documentation

* [Getting started](./DEVELOPMENT.md)
* [Release issue template](./RELEASE_ISSUE_TEMPLATE.md)
* [Early testers](./EARLY_TESTERS.md)
* [Releases](./RELEASES.md)
