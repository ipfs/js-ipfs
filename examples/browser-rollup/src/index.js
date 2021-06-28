import IPFS from 'ipfs'

const init = async () => {
  /**
   * @type {import('ipfs-core-types/src/index').IPFS}
   */
  const node = await IPFS.create()
  console.log(node)
}

init()
