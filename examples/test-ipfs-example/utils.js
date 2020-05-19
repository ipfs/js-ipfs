'use strict'

const fs = require('fs-extra')
const path = require('path')
const execa = require('execa')
const which = require('which')

async function startServer (dir) {
  async function serveFrom (appDir) {
    return new Promise((resolve, reject) => {
      let output = ''

      const proc = execa.command(`${path.resolve(__dirname, 'node_modules/.bin/http-server')} ${appDir} -a 127.0.0.1`, {
        cwd: __dirname,
        all: true
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
            stop: () => {
              console.info('Stopping server')
              proc.kill('SIGINT', {
                forceKillAfterTimeout: 2000
              })
            },
            url: `http://127.0.0.1:${port}`
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

  // running a bare index.html file
  const files = [
    path.join(dir, 'index.html')
  ]

  for (const f of files) {
    if (fs.existsSync(f)) {
      console.info('Found bare file', f)

      const distFile = path.resolve(process.cwd(), 'node_modules/ipfs/dist/index.min.js')

      console.info('Looking for IPFS dist file at', distFile)

      if (fs.existsSync(distFile)) {
        console.info('Found IPFS dist file')
      } else {
        console.info('Building IPFS')
        const proc = execa.command('npm run build', {
          cwd: path.resolve(dir, '../../packages/ipfs'),
          env: {
            ...process.env,
            NODE_ENV: 'production', // otherwise we only produce index.js and not index.min.js
            CI: true // needed for some "clever" build tools
          },
          all: true
        })
        proc.all.on('data', (data) => {
          process.stdout.write(data)
        })

        await proc
      }

      return Promise.resolve({
        url: `file://${f}`,
        stop: () => {}
      })
    }
  }

  throw new Error('Browser examples must contain a `public`, `dist` or `build` folder or an `index.html` file')
}

function ephemeralPort (min = 49152, max = 65535) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

async function isExecutable (command) {
  try {
    await fs.access(command, fs.constants.X_OK)

    return true
  } catch (err) {
    if (err.code === 'ENOENT') {
      return isExecutable(await which(command))
    }

    if (err.code === 'EACCES') {
      return false
    }

    throw err
  }
}

async function waitForOutput (expectedOutput, command, args = [], opts = {}) {
  if (!await isExecutable(command)) {
    args.unshift(command)
    command = 'node'
  }

  const proc = execa(command, args, { ...opts, all: true })
  let output = ''
  const time = 120000

  let foundExpectedOutput = false
  let cancelTimeout
  const timeoutPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Did not see "${expectedOutput}" in output from "${[command].concat(args).join(' ')}" after ${time / 1000}s`))

      setTimeout(() => {
        proc.kill()
      }, 100)
    }, time)

    cancelTimeout = () => {
      clearTimeout(timeout)
      resolve()
    }
  })

  proc.all.on('data', (data) => {
    process.stdout.write(data)
    output += data.toString('utf8')

    if (output.includes(expectedOutput)) {
      foundExpectedOutput = true
      proc.kill()
      cancelTimeout()
    }
  })

  try {
    await Promise.race([
      proc,
      timeoutPromise
    ])
  } catch (err) {
    if (!err.killed) {
      throw err
    }
  }

  if (!foundExpectedOutput) {
    throw new Error(`Did not see "${expectedOutput}" in output from "${[command].concat(args).join(' ')}"`)
  }
}

module.exports = {
  startServer,
  ephemeralPort,
  waitForOutput
}
