'use strict'

const path = require('path')
const esbuild = require('esbuild')
const EchoServer = require('aegir/utils/echo-server')

/** @type {import('aegir').Options["build"]["config"]} */
const buildConfig = {
  inject: [path.join(__dirname, '../../scripts/node-globals.js')],
  plugins: [
    {
      name: 'node built ins',
      setup (build) {
        build.onResolve({ filter: /^stream$/ }, () => {
          return { path: require.resolve('readable-stream') }
        })
      }
    }
  ]
}

/** @type {import('aegir').PartialOptions} */
module.exports = {
  build: {
    bundlesizeMax: '32KB',
    config: buildConfig
  },
  test: {
    browser: {
      config: {
        assets: '..',
        buildConfig
      }
    },
    async before () {
      await buildWorker()
      const echoServer = new EchoServer()
      await echoServer.start()

      return {
        echoServer,
        env: {
          IPFS_WORKER_URL: '/ipfs-message-port-client/dist/worker.bundle.js',
          ECHO_SERVER: `http://${echoServer.host}:${echoServer.port}`
        }
      }
    },
    async after (options, before) {
      await before.echoServer.stop()
    }
  }
}

const buildWorker = async () => {
  await esbuild.build(
    {
      entryPoints: [path.join(__dirname, 'test/util/worker.js')],
      bundle: true,
      mainFields: ['browser', 'module', 'main'],
      sourcemap: 'inline',
      outfile: path.join(__dirname, 'dist/worker.bundle.js'),
      define: {
        global: 'globalThis',
        'process.env.NODE_ENV': '"production"'
      },
      ...buildConfig
    }
  )
}
