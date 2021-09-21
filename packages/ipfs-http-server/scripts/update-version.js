import { readFile, writeFile } from 'fs/promises'

const pkg = JSON.parse(
  await readFile(
    new URL('../package.json', import.meta.url)
  )
)

await writeFile(
  new URL('../src/version.js', import.meta.url),
  `
export const ipfsHttpClient = '${pkg.devDependencies['ipfs-http-client']}'
`
)
