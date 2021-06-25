import { Configuration, ProvidePlugin } from 'webpack';
import * as NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

export default {
  plugins: [
    // fixes Module not found: Error: Can't resolve 'stream' in '.../node_modules/nofilter/lib'
    new NodePolyfillPlugin({}),
    // Note: stream-browserify has assumption about `Buffer` global in its
    // dependencies causing runtime errors. This is a workaround to provide
    // global `Buffer` until https://github.com/isaacs/core-util-is/issues/29
    // is fixed.
    new ProvidePlugin({
      global: ['global'],
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    })
  ],
} as Configuration;
