import IPFS from 'ipfs'

export default async function main () {
  const node = await IPFS.create()
  const version = await node.version()

  console.log('Version:', version.version)

  const file = await node.add({
    path: 'hello.txt',
    content: new TextEncoder().encode('Hello World 101')
  })

  console.log('Added file:', file.path, file.cid.toString())
  try {
    file.cid.toUpperCase()
  } catch(error) {

  }

  const decoder = new TextDecoder()
  let content = ''
  for await (const chunk of node.cat(file.cid)) {
    content += decoder.decode(chunk)  
  }

  console.log('Added file contents:', content)
}
