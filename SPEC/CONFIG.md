# Config API

* [config.get](#configget)
* [config.set](#configset)
* [config.replace](#configreplace)
* [config.profiles.list](#configprofileslist)
* [config.profiles.apply](#configprofilesapply)

### ⚠️ Note
Although not listed in the documentation, all the following APIs that actually return a **promise** can also accept a **final callback** parameter.

#### `config.get`

> Returns the currently being used config. If the daemon is off, it returns the stored config.

##### `ipfs.config.get([key])`

`key` is the key of the value that should be fetched from the config file. If no key is passed, then the whole config should be returned. `key` should be of type String.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object containing the configuration of the IPFS node |

**Example:**

```JavaScript
const config = await ipfs.config.get()
console.log(config)
```

A great source of [examples][] can be found in the tests for this API.

#### `config.set`

> Adds or replaces a config value.

##### `ipfs.config.set(key, value)`

`key` is the key value that will be added or replaced (in case of the value already). `key` should be of type String.

`value` value to be set.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

Note that this operation will **not** spark the restart of any service, i.e: if a config.replace changes the multiaddrs of the Swarm, Swarm will have to be restarted manually for the changes to take difference.

**Example:**

```JavaScript
await ipfs.config.set('Discovery.MDNS.Enabled', false)
// MDNS Discovery was set to false
```

A great source of [examples][] can be found in the tests for this API.

#### `config.replace`

> Adds or replaces a config file.

##### `ipfs.config.replace(config)`

`config` is a JSON object that contains the new config.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

Note that this operation will **not** spark the restart of any service, i.e: if a config.replace changes the multiaddrs of the Swarm, Swarm will have to be restarted manually for the changes to take difference.

**Example:**

```JavaScript
await ipfs.config.replace(newConfig)
// config has been replaced
```

A great source of [examples][] can be found in the tests for this API.

#### `config.profiles.list`

> List available config profiles

##### `ipfs.config.profiles.list([options])`

`options` is a object.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array with all the available config profiles |

**Example:**

```JavaScript
const profiles = await ipfs.config.profiles.list()
profiles.forEach(profile => {
  console.info(profile.name, profile.description)
})
```

A great source of [examples][] can be found in the tests for this API.

#### `config.profiles.apply`

> Apply a config profile

##### `ipfs.config.profiles.apply(name, [options])`

`name` is a string. Call `config.profiles.list()` for a list of valid profile names.
`options` an object that might contain the following values:
  - `dryRun` is a boolean which if true does not apply the profile

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object containing both the `original` and `updated` config |

**Example:**

```JavaScript
const diff = await ipfs.config.profiles.apply('lowpower')
console.info(diff.original)
console.info(diff.updated)
```

Note that you will need to restart your node for config changes to take effect.

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/config
