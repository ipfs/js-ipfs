'use strict'

const path = require('path')
const fs = require('fs')

// Where an example depends on `"ipfs": "^0.51.0"` and we've just released `ipfs@0.52.0`,
// go through all of the examples and update the version to `"ipfs": "^0.52.0"` - do
// that with every module under /packages

const PACKAGES_DIR = path.resolve(__dirname, '../packages')
const EXAMPLES_DIR = path.resolve(__dirname, '../examples')
const DEP_TYPES = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']

async function main () {
  for (const dir of fs.readdirSync(PACKAGES_DIR)) {
    const projectPkgPath = path.resolve(PACKAGES_DIR, dir, 'package.json')

    if (!fs.existsSync(projectPkgPath)) {
      continue
    }

    const projectPkg = JSON.parse(fs.readFileSync(projectPkgPath, { encoding: 'utf8' }))
    const projectDepVersion = `^${projectPkg.version}`

    for (const dir of fs.readdirSync(EXAMPLES_DIR)) {
      const examplePkgPath = path.resolve(EXAMPLES_DIR, dir, 'package.json')

      if (!fs.existsSync(examplePkgPath)) {
        continue
      }

      const examplePkg = JSON.parse(fs.readFileSync(examplePkgPath, { encoding: 'utf8' }))
      let dirty = false

      for (const depType of DEP_TYPES) {
        if (examplePkg[depType] && examplePkg[depType][projectPkg.name] && examplePkg[depType][projectPkg.name] !== projectDepVersion) {
          console.info(`Updating ${examplePkg.name} ${projectPkg.name}: ${examplePkg[depType][projectPkg.name]} -> ${projectDepVersion}`)
          examplePkg[depType][projectPkg.name] = projectDepVersion
          dirty = true
        }
      }

      if (dirty) {
        fs.writeFileSync(examplePkgPath, JSON.stringify(examplePkg, null, 2) + '\n', { encoding: 'utf8' })
      }
    }
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})