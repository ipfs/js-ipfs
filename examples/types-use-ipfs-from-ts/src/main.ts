import { IPFS, create } from 'ipfs'
import CID from 'cids'

export default async function main() {
  const node = await create()
  const version = await node.version()

  console.log('Version:', version.version)

  const file = await node.add({
    path: 'hello.txt',
    content: new TextEncoder().encode('Hello World 101')
  })

  console.log('Added file:', file.path, file.cid.toString())
  try {
    // @ts-expect-error CID has no toUpperCase method
    file.cid.toUpperCase()
  } catch (error) {

  }

  const content = await readFile(node, file.cid)

  console.log('Added file contents:', content)
}

const readFile = async (ipfs: IPFS, cid: CID): Promise<string> => {
  const decoder = new TextDecoder()
  let content = ''
  for await (const chunk of ipfs.cat(cid)) {
    content += decoder.decode(chunk)
  }

  return content
}
