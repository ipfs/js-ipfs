import fs from 'fs'
import Path from 'path'

export function path () {
  const paths = []

  // simulate node's node_modules lookup
  for (let i = 0; i < process.cwd().split(Path.sep).length; i++) {
    const dots = new Array(i).fill('..')

    paths.push(
      Path.resolve(
        Path.join(process.cwd(), ...dots, 'node_modules', 'ipfs')
      )
    )
  }

  const resourcePath = paths.find(path => fs.existsSync(path))

  if (!resourcePath) {
    throw new Error(`Could not find ipfs module in paths: \n${paths.join('\n')}`)
  }

  const pkg = JSON.parse(fs.readFileSync(resourcePath + Path.sep + 'package.json', {
    encoding: 'utf-8'
  }))

  const bin = pkg.bin.jsipfs

  return Path.resolve(Path.join(resourcePath, bin))
}
