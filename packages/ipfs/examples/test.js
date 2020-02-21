'use strict'

process.env.NODE_ENV = 'test'
process.env.CI = true // needed for some "clever" build tools

const fs = require('fs-extra')
const path = require('path')
const execa = require('execa')
const dir = path.join(__dirname, process.argv[2])
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
  await installDeps(dir)
  await build(dir)

  if (dir.includes('examples/browser-')) {
    await runBrowserTest(dir)
  } else {
    await runNodeTest(dir)
  }
}

async function installDeps (dir) {
  if (!fs.existsSync(path.join(dir, 'package.json'))) {
    console.info('Nothing to install in', dir)
    return
  }

  if (fs.existsSync(path.join(dir, 'node_modules'))) {
    console.info('Dependencies already installed in', dir)
    return
  }

  const proc = execa.command('npm install', {
    cwd: dir,
    all: true
  })
  proc.all.on('data', (data) => {
    process.stdout.write(data)
  })

  await proc
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

  const proc = execa('nightwatch', [path.join(dir, 'test.js')], {
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

async function runNodeTest (dir) {
  console.info('Running node tests in', dir)

  const runTest = require(path.join(dir, 'test.js'))

  await runTest()
}
