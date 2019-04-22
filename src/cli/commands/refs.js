'use strict'

const { print } = require('../utils')

// Default formats
const Format = {
  default: '<dst>',
  edges: '<src> -> <dst>'
}

module.exports = {
  command: 'refs <key>',

  describe: 'List links (references) from an object',

  builder: {
    r: {
      alias: 'recursive',
      desc: 'Recursively list links of child nodes.',
      type: 'boolean',
      default: false
    },
    format: {
      desc: 'Output edges with given format. Available tokens: <src> <dst> <linkname>.',
      type: 'string',
      default: Format.default
    },
    e: {
      alias: 'edges',
      desc: 'Output edge format: `<from> -> <to>`',
      type: 'boolean',
      default: false
    },
    u: {
      alias: 'unique',
      desc: 'Omit duplicate refs from output.',
      type: 'boolean',
      default: false
    },
    'max-depth': {
      desc: 'Only for recursive refs, limits fetch and listing to the given depth.',
      type: 'number'
    }
  },

  handler ({ getIpfs, key, recursive, format, e, u, resolve, maxDepth }) {
    resolve((async () => {
      if (format !== Format.default && e) {
        throw new Error('Cannot set edges to true and also specify format')
      }

      if (maxDepth === 0) {
        return
      }

      const ipfs = await getIpfs()
      let links = await ipfs.refs(key, { recursive, maxDepth })
      if (!links.length) {
        return
      }

      const linkDAG = getLinkDAG(links)
      format = e ? Format.edges : format || Format.default
      printLinks(linkDAG, links[0], format, u && new Set())
    })())
  }
}

// Get links as a DAG Object
// { <linkName1>: [link2, link3, link4], <linkName2>: [...] }
function getLinkDAG (links) {
  const linkNames = {}
  for (const link of links) {
    linkNames[link.name] = link
  }

  const linkDAG = {}
  for (const link of links) {
    const parentName = link.path.substring(0, link.path.lastIndexOf('/'))
    linkDAG[parentName] = linkDAG[parentName] || []
    linkDAG[parentName].push(link)
  }
  return linkDAG
}

// Print children of a link
function printLinks (linkDAG, link, format, uniques) {
  const children = linkDAG[link.path] || []
  for (const child of children) {
    if (!uniques || !uniques.has(child.hash)) {
      uniques && uniques.add(child.hash)
      printLink(link, child, format)
      printLinks(linkDAG, child, format, uniques)
    }
  }
}

// Print formatted link
function printLink (src, dst, format) {
  let out = format.replace(/<src>/g, src.hash)
  out = out.replace(/<dst>/g, dst.hash)
  out = out.replace(/<linkname>/g, dst.name)
  print(out)
}
