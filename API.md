<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [API Reference](#api-reference)
  - [Core](#core)
      - [`version([callback])`](#versioncallback)
      - [`id([callback])`](#idcallback)
      - [`block`](#block)
        - [`block.put(buffer, [callback])`](#blockputbuffer-callback)
        - [`block.get(hash, [callback])`](#blockgethash-callback)
        - [`block.stat(hash, [callback])`](#blockstathash-callback)
      - [`object`](#object)
        - [`object.put(buffer, encoding, [callback])`](#objectputbuffer-encoding-callback)
        - [`object.get(hash, [callback])`](#objectgethash-callback)
        - [`object.data(hash, [callback])`](#objectdatahash-callback)
        - [`object.stat(hash, [callback])`](#objectstathash-callback)
        - [`object.links(hash, [callback])`](#objectlinkshash-callback)
        - [`object.new(hash, [callback])`](#objectnewhash-callback)
        - [`object.patch`](#objectpatch)
          - [`object.patch.addLink(hash, name, ref, [callback])`](#objectpatchaddlinkhash-name-ref-callback)
          - [`object.patch.rmLink(hash, name, [callback])`](#objectpatchrmlinkhash-name-callback)
          - [`object.patch.setData(hash, data, [callback])`](#objectpatchsetdatahash-data-callback)
          - [`object.patch.appendData(hash, data, ref, [callback])`](#objectpatchappenddatahash-data-ref-callback)
      - [`refs(hash, options, [callback])`](#refshash-options-callback)
        - [`refs.local(hash, [callback])`](#refslocalhash-callback)
      - [`pin`](#pin)
        - [`pin.add(hash, options, [callback])`](#pinaddhash-options-callback)
        - [`pin.remove(hash, options, [callback])`](#pinremovehash-options-callback)
        - [`pin.list(hash, options, [callback])`](#pinlisthash-options-callback)
      - [`log`](#log)
        - [`log.tail([callback])`](#logtailcallback)
  - [Extensions](#extensions)
      - [`add(arrayOrBufferOrStream, [callback])`](#addarrayorbufferorstream-callback)
      - [`name`](#name)
        - [`name.publish(hash, [callback])`](#namepublishhash-callback)
        - [`name.resolve(hash, [callback])`](#nameresolvehash-callback)
      - [`files`](#files)
        - [`files.cp(src, target, [callback])`](#filescpsrc-target-callback)
        - [`files.ls(folder, [callback])`](#fileslsfolder-callback)
        - [`files.mkdir(folder, [options, callback])`](#filesmkdirfolder-options-callback)
        - [`files.stat(fileOrFolder, [callback])`](#filesstatfileorfolder-callback)
        - [`files.rm(fileOrFolder, [options, callback])`](#filesrmfileorfolder-options-callback)
        - [`files.read(fileOrFolder, [callback])`](#filesreadfileorfolder-callback)
        - [`files.write(file, bufferOrArray, [options, callback])`](#fileswritefile-bufferorarray-options-callback)
        - [`files.mv(src, target, [callback])`](#filesmvsrc-target-callback)
      - [`mount(ipfs, ipns, [callback])`](#mountipfs-ipns-callback)
  - [Tooling](#tooling)
      - [`commands([callback])`](#commandscallback)
      - [`update`](#update)
        - [`update.apply([callback])`](#updateapplycallback)
        - [`update.check([callback])`](#updatecheckcallback)
        - [`update.log([callback])`](#updatelogcallback)
      - [`diag`](#diag)
        - [`diag.net([callback])`](#diagnetcallback)
        - [`diag.sys([callback])`](#diagsyscallback)
        - [`diag.cmds([callback])`](#diagcmdscallback)
  - [Network](#network)
      - [`ping(id, [callback])`](#pingid-callback)
      - [`dht`](#dht)
        - [`dht.findprovs([callback])`](#dhtfindprovscallback)
        - [`dht.get(key, [options, callback])`](#dhtgetkey-options-callback)
        - [`dht.put(key, value, [options, callback])`](#dhtputkey-value-options-callback)
      - [`swarm`](#swarm)
        - [`swarm.peers([callback])`](#swarmpeerscallback)
        - [`swarm.connect(address, [callback])`](#swarmconnectaddress-callback)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# API Reference

We classify the API calls by 'core', 'extensions', 'tooling', and 'network', following the same API spec organization available at [ipfs/specs](https://github.com/ipfs/specs/tree/master/api).

The tests folder also contains great examples that can be used to understand how this client library interacts with the HTTP-API. You can find the [tests here](test/api).

## Core

#### `version([callback])`

- [tests](test/api/version.spec.js)

#### `id([callback])`

- [tests](test/api/id.spec.js)

#### `block`

- [tests](test/api/block.spec.js)

##### `block.put(buffer, [callback])`
##### `block.get(hash, [callback])`
##### `block.stat(hash, [callback])`

#### `object`

- [tests](test/api/object.spec.js)

##### `object.put(buffer, encoding, [callback])`
##### `object.get(hash, [callback])`
##### `object.data(hash, [callback])`
##### `object.stat(hash, [callback])`
##### `object.links(hash, [callback])`
##### `object.new(hash, [callback])`

##### `object.patch`

###### `object.patch.addLink(hash, name, ref, [callback])`
###### `object.patch.rmLink(hash, name, [callback])`
###### `object.patch.setData(hash, data, [callback])`
###### `object.patch.appendData(hash, data, ref, [callback])`

#### `refs(hash, options, [callback])`

- [tests](test/api/refs.spec.js)

##### `refs.local(hash, [callback])`


#### `pin`

- [tests](test/api/pin.spec.js)

##### `pin.add(hash, options, [callback])`
##### `pin.remove(hash, options, [callback])`
##### `pin.list(hash, options, [callback])`

#### `log`

- [tests](test/api/log.spec.js)

##### `log.tail([callback])`

## Extensions

#### `add(arrayOrBufferOrStream, [callback])`

- [tests](test/api/add.spec.js)

#### `name`

- [tests](test/api/name.spec.js)

##### `name.publish(hash, [callback])`
##### `name.resolve(hash, [callback])`

#### `files`

- [tests](test/api/files.spec.js)

##### `files.cp(src, target, [callback])`
##### `files.ls(folder, [callback])`
##### `files.mkdir(folder, [options, callback])`
##### `files.stat(fileOrFolder, [callback])`
##### `files.rm(fileOrFolder, [options, callback])`
##### `files.read(fileOrFolder, [callback])`
##### `files.write(file, bufferOrArray, [options, callback])`
##### `files.mv(src, target, [callback])`

#### `mount(ipfs, ipns, [callback])`

- [tests](test/api/mount.spec.js)

## Tooling

#### `commands([callback])`

- [tests](test/api/commands.spec.js)

#### `update`

- [tests](test/api/update.spec.js)

##### `update.apply([callback])`
##### `update.check([callback])`
##### `update.log([callback])`

#### `diag`

- [tests](test/api/diag.spec.js)

##### `diag.net([callback])`
##### `diag.sys([callback])`
##### `diag.cmds([callback])`

## Network

#### `ping(id, [callback])`

- [tests](test/api/ping.spec.js)

#### `dht`

- [tests](test/api/dht.spec.js)

##### `dht.findprovs([callback])`
##### `dht.get(key, [options, callback])`
##### `dht.put(key, value, [options, callback])`

#### `swarm`

- [tests](test/api/swarm.spec.js)

##### `swarm.peers([callback])`
##### `swarm.connect(address, [callback])`
