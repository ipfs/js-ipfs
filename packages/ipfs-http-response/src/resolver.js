import pTryEach from 'p-try-each'
import { render } from './dir-view/index.js'

const INDEX_HTML_FILES = [
  'index.html',
  'index.htm',
  'index.shtml'
]

/**
 * @param {*} ipfs
 * @param {*} path
 */
const findIndexFile = (ipfs, path) => {
  return pTryEach(INDEX_HTML_FILES.map(file => {
    return async () => {
      const stats = await ipfs.files.stat(`${path}/${file}`)

      return {
        name: file,
        cid: stats.cid
      }
    }
  }))
}

/**
 * @param {*} ipfs
 * @param {string} path
 * @param {*} cid
 */
export const directory = async (ipfs, path, cid) => {
  // Test if it is a Website
  try {
    const res = await findIndexFile(ipfs, path)

    return [{ Name: res.name }]
  } catch (/** @type {any} */ err) {
    if (err.message.includes('does not exist')) {
      // not a website, just show a directory listing
      const result = await ipfs.dag.get(cid)

      return render(path, result.value.Links)
    }

    throw err
  }
}

/**
 * @param {*} ipfs
 * @param {string} path
 */
export const cid = async (ipfs, path) => {
  const stats = await ipfs.files.stat(path)

  if (stats.type.includes('directory')) {
    const err = Object.assign(new Error('This dag node is a directory'), {
      cid: stats.cid,
      fileName: stats.fileName,
      dagDirType: stats.type
    })

    throw err
  }

  return { cid: stats.cid }
}
