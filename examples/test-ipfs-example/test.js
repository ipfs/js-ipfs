#!/usr/bin/env node

'use strict'

process.env.NODE_ENV = 'test'
process.env.CI = true // needed for some "clever" build tools

const fs = require('fs-extra')
const path = require('path')
const execa = require('execa')
const dir = process.cwd()
const { startServer } = require('./utils')

testExample(dir)
  .then(() => {}, (err) => {
    if (err.exitCode) {
      process.exit(err.exitCode)
    }

    console.error(err)
    process.exit(1)
  })

async function testExample (dir) {
  await build(dir)

  const test = require(path.join(dir, 'test.js'))

  if (typeof test === 'function') {
    console.info('Running tests in', dir)

    await test()
  } else {
    await runBrowserTest(dir)
  }

  process.exit(0)
}

async function build (dir) {
  const pkgJson = path.join(dir, 'package.json')

  if (!fs.existsSync(pkgJson)) {
    console.info('Nothing to build in', dir)
    return
  }

  const pkg = require(pkgJson)
  let build

  if (pkg.scripts.bundle) {
    build = 'bundle'
  }

  if (pkg.scripts.build) {
    build = 'build'
  }

  if (!build) {
    console.info('No "build" or "bundle" script in', pkgJson)
    return
  }

  const proc = execa('npm', ['run', build], {
    cwd: dir,
    all: true
  })
  proc.all.on('data', (data) => {
    process.stdout.write(data)
  })

  await proc
}

async function runBrowserTest (dir) {
  console.info('Running browser tests in', dir)

  const server = await startServer(dir)

  console.info('Running tests at', server.url)

  const proc = execa(path.resolve(__dirname, 'node_modules/.bin/nightwatch'), [ path.join(dir, 'test.js'), '--config', path.resolve(__dirname, 'nightwatch.conf.js') ], {
    cwd: __dirname,
    env: {
      ...process.env,
      IPFS_EXAMPLE_TEST_URL: server.url
    },
    all: true
  })
  proc.all.on('data', (data) => {
    process.stdout.write(data)
  })

  try {
    await proc
  } finally {
    server.stop()
  }
}
