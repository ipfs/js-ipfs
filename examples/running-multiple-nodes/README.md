# Running multiple JS IPFS nodes

This example takes you through the process needed to run 2 or more JS IPFS nodes on the same computer.

## Before you start

First clone this repo, install dependencies in the project root and build the project.

```console
$ git clone https://github.com/ipfs/js-ipfs.git
$ cd js-ipfs
$ npm install
$ npm run build
```

## Running the example

### Via the CLI

Firstly, you'll want to use the `IPFS_PATH` env variable to get a different repo for each instance. Initialise a new IPFS repo like this:

```sh
# IPFS_PATH by default is `~/.jsipfs`.
# The following instructs JS IPFS to use the path `~/.jsipfs2` instead:
IPFS_PATH=~/.jsipfs2 jsipfs init

# Repeat this for as many nodes as you want to run...
```

Secondly, you'll need them to bind to different ports because otherwise bad things happen.

With the CLI, after you've run `ipfs init` you can either edit the config file at `~/.jsipfs/config` (replacing `~/.jsipfs` with the repo path you specified above) or use the config command to update the config e.g. `ipfs config Addresses.API /ip4/0.0.0.0/tcp/4012`. Then start the node with `ipfs daemon`:

```sh
# edit the address ports
vi ~/.jsipfs2/config

# OR

IPFS_PATH=~/.jsipfs2 jsipfs config Addresses.API /ip4/127.0.0.1/tcp/5012

# Repeat this for as many nodes as you want to run...
```

```sh
# ...and then start the daemon
IPFS_PATH=~/.jsipfs2 jsipfs daemon

# Repeat this for as many nodes as you want to run...
```

### Programmatically

Firstly, you'll want to pass the [`repo`](https://github.com/ipfs/js-ipfs#optionsrepo) option to the constructor to get a different repo for each instance:

```js
// The repo path by default is `os.homedir() + '/.jsipfs'`.
await IPFS.create({ repo: os.homedir() + '/.jsipfs2' })
```

Secondly, you'll need them to bind to different ports because otherwise bad things happen.

To do this, simply pass the different ports to the [`config`](https://github.com/ipfs/js-ipfs#optionsconfig) constructor option. All together:

```js
await IPFS.create({
  repo: os.homedir() + '/.jsipfs2',
  config: {
    Addresses: {
      Swarm: [
        '/ip4/0.0.0.0/tcp/4012',
        '/ip4/127.0.0.1/tcp/4013/ws'
      ],
      API: '/ip4/127.0.0.1/tcp/5012',
      Gateway: '/ip4/127.0.0.1/tcp/9191'
    }
  }
})
```
