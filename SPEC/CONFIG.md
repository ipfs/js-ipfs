# Config API

* [config.get](#configget)
* [config.set](#configset)
* [config.replace](#configreplace)
* [config.profiles.list](#configprofileslist)
* [config.profiles.apply](#configprofilesapply)

#### `config.get`

> Returns the currently being used config. If the daemon is off, it returns the stored config.

##### `ipfs.config.get([key], [callback])`

`key` is the key of the value that should be fetched from the config file. If no key is passed, then the whole config should be returned. `key` should be of type String.

`callback` must follow `function (err, config) {}` signature, where `err` is an error if the operation was not successful and `config` is a JSON object containing the configuration of the IPFS node.

If no callback is passed, a [promise][] is returned

**Example:**

```JavaScript
ipfs.config.get((err, config) => {
  if (err) {
    throw err
  }
  console.log(config)
})
```

A great source of [examples][] can be found in the tests for this API.

#### `config.set`

> Adds or replaces a config value.

##### `ipfs.config.set(key, value, [callback])`

`key` is the key value that will be added or replaced (in case of the value already). `key` should be of type String.

`value` value to be set.

`callback` must follow `function (err) {}` signature, where `err` is an error if the operation was not successful.

If no callback is passed, a [promise][] is returned

Note that this operation will **not** spark the restart of any service, i.e: if a config.replace changes the multiaddrs of the Swarm, Swarm will have to be restarted manually for the changes to take difference.

**Example:**

```JavaScript
ipfs.config.set('Discovery.MDNS.Enabled', false, (err) => {
  if (err) {
    throw err
  }
  // MDNS Discovery was set to false
})
```

A great source of [examples][] can be found in the tests for this API.

#### `config.replace`

> Adds or replaces a config file.

##### `ipfs.config.replace(config, [callback])`

`config` is a JSON object that contains the new config.

`callback` must follow `function (err) {}` signature, where `err` is an error if the operation was not successful.

If no callback is passed, a [promise][] is returned

Note that this operation will **not** spark the restart of any service, i.e: if a config.replace changes the multiaddrs of the Swarm, Swarm will have to be restarted manually for the changes to take difference.

**Example:**

```JavaScript
ipfs.config.replace(newConfig, (err) => {
  if (err) {
    throw err
  }
  // config has been replaced
})
```

A great source of [examples][] can be found in the tests for this API.

#### `config.profiles.list`

> List available config profiles

##### `ipfs.config.profiles.list([options], [callback])`

`options` is a object.
`callback` must follow `function (err, result) {}` signature, where `err` is an error if the operation was not successful.

If no callback is passed, a [promise][] is returned

**Example:**

```JavaScript
ipfs.config.profiles.list(newConfig, (err, profiles) => {
  if (err) {
    throw err
  }

  profiles.forEach(profile => {
    console.info(profile.name, profile.description)
  })
})
```

A great source of [examples][] can be found in the tests for this API.

#### `config.profiles.apply`

> Apply a config profile

##### `ipfs.config.profiles.apply(name, [options], [callback])`

`name` is a string. Call `config.profiles.list()` for a list of valid profile names.
`options` an object that might contain the following values:
  - `dryRun` is a boolean which if true does not apply the profile
`callback` must follow the `function (err, result) {}` signature, where `err` is an error if the operation was not successful.

If no callback is passed, a [promise][] is returned

**Example:**

```JavaScript
ipfs.config.profiles.apply('lowpower', (err, diff) => {
  if (err) {
    throw err
  }

  console.info(diff.old)
  console.info(diff.new)
})
```

Note that you will need to restart your node for config changes to take effect.

A great source of [examples][] can be found in the tests for this API.

[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/config
