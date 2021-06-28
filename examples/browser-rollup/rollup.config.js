import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import copy from 'rollup-plugin-copy'

const outputDir = './dist'

export default () => {
  const bundle = {
    input: ['./src/index.js'],
    output: [
      {
        dir: outputDir,
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        format: 'iife',
      },
    ],
    context: 'window',
    plugins: [
      nodePolyfills(),
      nodeResolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs({
        transformMixedEsModules: true,
        ignoreGlobal: true,
      }),
      json(),
      // Optional: copy any static assets to build directory
      copy({
        targets: [{ src: 'public/index.html', dest: outputDir }],
      }),
    ],
  }

  return bundle
}