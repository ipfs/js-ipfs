'use strict'
const { createFactory } = require('ipfsd-ctl')
const merge = require('merge-options')
const set = require('just-safe-set')

const factory = (options, overrides) => {
  const df = createFactory(
    merge({
      test: true,
      type: 'proc',
      ipfsModule: {
        path: require.resolve('../../src'),
        ref: require('../../src')
      },
      ipfsHttpModule: {
        path: require.resolve('ipfs-http-client'),
        ref: require('ipfs-http-client')
      }
    }, options),
    merge({
      js: {
        ipfsBin: './src/cli/bin.js'
      }
    }, overrides)
  )

  const _spawn = df.spawn.bind(df)
  df.spawn = options => {
    options = options || {}

    if (options.type === 'js') {
      // Do not use the test profile for this remote node so we can connect to it
      // FIXME use [] when resolved: https://github.com/ipfs/js-ipfsd-ctl/pull/433
      set(options, 'ipfsOptions.init.profiles', null)
    }

    return _spawn(options)
  }

  return df
}
module.exports = factory
