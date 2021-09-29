import { readFile, writeFile } from 'fs/promises'

const pkg = JSON.parse(
  await readFile(
    new URL('../package.json', import.meta.url)
  )
)

await writeFile(
  new URL('../src/package.js', import.meta.url),
  `
export const name = '${pkg.name}'
export const version = '${pkg.version}'
export const node = '${pkg.engines.node}'
`
)
