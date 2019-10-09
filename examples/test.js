'use strict'

const fs = require('fs-extra')
const path = require('path')
const execa = require('execa')
const dir = path.join(__dirname, process.argv[2])

testExample(dir)
  .then(() => {}, (err) => { throw err })

async function testExample (dir) {
  //await installDeps(dir)
  //await build(dir)

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

  const proc = execa.command('npm install', {
    cwd: dir
  })
  proc.all.on('data', (data) => {
    process.stdout.write(data)
  })

  await proc
}

async function build (dir) {
  if (!fs.existsSync(path.join(dir, 'package.json'))) {
    console.info('Nothing to build in', dir)
    return
  }

  const proc = execa.command('npm run build', {
    cwd: dir,
    env: {
      ...process.env,
      CI: true // needed for some "clever" build tools
    }
  })
  proc.all.on('data', (data) => {
    process.stdout.write(data)
  })

  await proc
}

async function runBrowserTest (dir) {
  console.info('Running browser tests in', dir)

  const {
    stopServer,
    serverUrl
  } = await startServer(dir)

  console.info('Running tests at', serverUrl)

  const proc = execa('nightwatch', [ path.join(dir, 'test.js') ], {
    cwd: __dirname,
    env: {
      ...process.env,
      CI: true,
      IPFS_EXAMPLE_TEST_URL: serverUrl
    }
  })
  proc.all.on('data', (data) => {
    process.stdout.write(data)
  })

  try {
    await proc
  } finally {
    stopServer()
  }
}

async function runNodeTest (dir) {
  console.info('Running node tests in', dir)
}

async function startServer (dir) {
  async function serveFrom (path) {
    return new Promise((resolve, reject) => {
      let output = ''

      const proc = execa.command(`http-server ${path} -a 127.0.0.1`, {
        cwd: __dirname
      })
      proc.all.on('data', (data) => {
        process.stdout.write(data)

        const line = data.toString('utf8')
        output += line

        if (output.includes('Hit CTRL-C to stop the server')) {
          // find the port
          const port = output.match(/http:\/\/127.0.0.1:(\d+)/)[1]

          if (!port) {
            throw new Error(`Could not find port in ${output}`)
          }

          resolve({
            stopServer: () => {
              console.info('Stopping server')
              proc.kill('SIGINT', {
                forceKillAfterTimeout: 2000
              })
            },
            serverUrl: `http://127.0.0.1:${port}`
          })
        }
      })

      proc.then(() => {}, (err) => reject(err))
    })
  }

  // start something..
  const serverPaths = [
    path.join(dir, 'build'),
    path.join(dir, 'dist'),
    path.join(dir, 'public')
  ]

  for (const p of serverPaths) {
    if (fs.existsSync(p)) {
      return serveFrom(p)
    }
  }

  const files = [
    path.join(dir, 'index.html')
  ]

  for (const f of files) {
    if (fs.existsSync(f)) {
      console.info('Found', f)

      return Promise.resolve({
        serverUrl: `file://${f}`,
        stopServer: () => {}
      })
    }
  }

  throw new Error('Browser examples must contain a `public`, `dist` or `build` folder or an `index.html` file')
}
