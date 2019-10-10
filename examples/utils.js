'use strict'

const fs = require('fs-extra')
const path = require('path')
const execa = require('execa')

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

      console.info('Building IPFS')
      const proc = execa.command('npm run build', {
        cwd: path.resolve(dir, '../../'),
        env: {
          ...process.env,
          CI: true // needed for some "clever" build tools
        }
      })
      proc.all.on('data', (data) => {
        process.stdout.write(data)
      })

      await proc

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

module.exports = {
  startServer,
  ephemeralPort
}
