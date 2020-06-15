# Config API <!-- omit in toc -->

- [`ipfs.config.get(key, [options])`](#ipfsconfiggetkey-options)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [`ipfs.config.getAll([options])`](#ipfsconfiggetkey-options)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [`ipfs.config.set(key, value, [options])`](#ipfsconfigsetkey-value-options)
  - [Parameters](#parameters-1)
  - [Options](#options-1)
  - [Returns](#returns-1)
  - [Example](#example-1)
- [`ipfs.config.replace(config, [options])`](#ipfsconfigreplaceconfig-options)
  - [Parameters](#parameters-2)
  - [Options](#options-2)
  - [Returns](#returns-2)
  - [Example](#example-2)
- [`ipfs.config.profiles.list([options])`](#ipfsconfigprofileslistoptions)
  - [Parameters](#parameters-3)
  - [Options](#options-3)
  - [Returns](#returns-3)
  - [Example](#example-3)
- [`ipfs.config.profiles.apply(name, [options])`](#ipfsconfigprofilesapplyname-options)
  - [Parameters](#parameters-4)
  - [Options](#options-4)
  - [Returns](#returns-4)
  - [Example](#example-4)

## `ipfs.config.get(key, [options])`

> Returns the currently being used config. If the daemon is off, it returns the stored config.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | `String` | The key of the value that should be fetched from the config file.  |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object containing the configuration of the IPFS node |

### Example

```JavaScript
const config = await ipfs.config.get()
console.log(config)
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.config.getAll([options])`

> Returns the full config been used. If the daemon is off, it returns the stored config.

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object containing the configuration of the IPFS node |

### Example

```JavaScript
const config = await ipfs.config.getAll()
console.log(config)
```

A great source of [examples][] can be found in the tests for this API.


## `ipfs.config.set(key, value, [options])`

> Adds or replaces a config value.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | `String` | The key of the value that should be added or replaced  |
| value | any | The value to be set  |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

Note that this operation will **not** spark the restart of any service, i.e: if a config.replace changes the multiaddrs of the Swarm, Swarm will have to be restarted manually for the changes to take difference.

### Example

```JavaScript
await ipfs.config.set('Discovery.MDNS.Enabled', false)
// MDNS Discovery was set to false
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.config.replace(config, [options])`

> Adds or replaces a config file

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| config | Object | An object that contains the new config |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

Note that this operation will **not** spark the restart of any service, i.e: if a config.replace changes the multiaddrs of the Swarm, Swarm will have to be restarted manually for the changes to take difference.

### Example

```JavaScript
const newConfig = {
  Bootstrap: []
}

await ipfs.config.replace(newConfig)
// config has been replaced
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.config.profiles.list([options])`

> List available config profiles

### Parameters

None

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array with all the available config profiles |

### Example

```JavaScript
const profiles = await ipfs.config.profiles.list()
profiles.forEach(profile => {
  console.info(profile.name, profile.description)
})
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.config.profiles.apply(name, [options])`

> Apply a config profile

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | `String` | The name of the profile to apply |

Call `config.profiles.list()` for a list of valid profile names.

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| dryRun | `boolean` | false | If true does not apply the profile |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object containing both the `original` and `updated` config |

### Example

```JavaScript
const diff = await ipfs.config.profiles.apply('lowpower')
console.info(diff.original)
console.info(diff.updated)
```

Note that you will need to restart your node for config changes to take effect.

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/config
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
