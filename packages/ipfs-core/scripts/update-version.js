import { readFile, writeFile } from 'fs/promises'

const pkg = JSON.parse(
  await readFile(
    new URL('../package.json', import.meta.url)
  )
)

await writeFile(
  new URL('../src/version.js', import.meta.url),
  `
export const version = '${pkg.version}'
export const commit = '${pkg.gitHead || ''}'
`
)
