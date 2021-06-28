import { nodeResolve } from '@rollup/plugin-node-resolve'
import { babel, getBabelOutputPlugin } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import summary from 'rollup-plugin-summary'
import copy from 'rollup-plugin-copy'
import clear from 'rollup-plugin-clear'
import { terser } from 'rollup-plugin-terser'
import nodePolyfills from 'rollup-plugin-polyfill-node'

const outputDir = './dist'

const getBabelConfig = (modern) => {
  /**
   * Will be used for the legacy build
   */
  const presetEnv = [
    '@babel/preset-env',
    {
      modules: 'umd',
      targets: {
        browsers: ['>0.25%', 'not op_mini all'],
      },
    },
  ]
  /**
   * Will be used for the modern build
   */
  const presetModule = [
    '@babel/preset-modules',
    {
      loose: true,
    },
  ]

  const alwaysUsedPresets = []
  const alwaysUsedPlugins = []

  /**
   * Only loaded in the legacy build
   */
  const legacyPlugins = ['@babel/plugin-proposal-object-rest-spread']

  const configsLegacy = {
    presets: [presetEnv, ...alwaysUsedPresets],
    plugins: [...alwaysUsedPlugins, ...legacyPlugins],
  }

  const configsModern = {
    presets: [presetModule, ...alwaysUsedPresets],
    plugins: [...alwaysUsedPlugins],
  }

  return {
    ...(modern ? configsModern : configsLegacy),
  }
}

const getConfig = () => {
  const config = [
    clear({
      targets: [`${outputDir}`],
    }),
    nodePolyfills(),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs({
      ignoreGlobal: true,
    }),
    json(),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
    }),
    // Optional: copy any static assets to build directory
    copy({
      targets: [{ src: 'public/index.html', dest: outputDir }],
    }),
    terser({
      compress: {
        unused: false,
        collapse_vars: false,
      },
      output: {
        comments: false,
      },
    }),
    // Print bundle summary
    summary(),
  ]

  return config
}

export default () => {
  const bundle = {
    input: ['./src/index.js'],
    output: [
      {
        dir: outputDir,
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        format: 'es',
        plugins: [getBabelOutputPlugin(getBabelConfig(true))],
      },
      {
        dir: outputDir,
        entryFileNames: '[name].legacy.js',
        chunkFileNames: '[name]-[hash].legacy.js',
        format: 'es',
        plugins: [getBabelOutputPlugin(getBabelConfig(false))],
      },
    ],
    context: 'window',
    plugins: getConfig(),
  }

  return bundle
}
