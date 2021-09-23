import { readFile, writeFile } from 'fs/promises'

const ipfs = JSON.parse(
  await readFile(
    new URL('../dist/ipfs.json', import.meta.url)
  )
)

await writeFile(
  new URL('../src/index.js', import.meta.url),
  `
export default ${JSON.stringify(ipfs, null, 2)}
`
)
