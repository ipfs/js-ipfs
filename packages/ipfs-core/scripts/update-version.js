import { readFile, writeFile } from 'fs/promises'

const pkg = JSON.parse(
  await readFile(
    new URL('../package.json', import.meta.url)
  )
)

await writeFile(
  new URL('../src/version.js', import.meta.url),
  `
export const ipfsCore = '${pkg.version}'
export const commit = '${pkg.gitHead || ''}'
export const interfaceIpfsCore = '${pkg.devDependencies['interface-ipfs-core']}'
`
)
