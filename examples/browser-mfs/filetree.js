'use strict'

const {
  log,
  createNode
} = require('./utils')

const FILE_TYPES = {
  FILE: 0,
  DIRECTORY: 1
}

let selected = {}

const getSelected = () => {
  return Object.values(selected)
}

const loadFiles = async (ipfs, path) => {
  const output = {}
  path = path.replace(/\/\/+/g, '/')

  const contents = await ipfs.files.ls(path, {
    long: true
  })
    .catch(error => log(error))

  for (let i = 0; i < contents.length; i++) {
    let entry = contents[i]
    output[entry.name] = entry

    if (entry.type === FILE_TYPES.DIRECTORY) {
      entry.contents = await loadFiles(ipfs, `${path}/${entry.name}`)
    }
  }

  return output
}

const listFiles = (parent, files, prefix) => {
  const fileNames = Object.keys(files)

  fileNames.forEach((name, index) => {
    const file = files[name]
    const lastFile = index === fileNames.length - 1
    const listIcon = lastFile ? '└── ' : '├── '
    const listing = `${prefix}${listIcon}${name}`

    if (file.type === FILE_TYPES.DIRECTORY) {
      parent.appendChild(createNode('pre', `${listing}/`))
      let descender = '|'
      let directoryPrefix = `${prefix}${descender}   `

      if (lastFile) {
        directoryPrefix = `${prefix}    `
      }

      listFiles(parent, file.contents, directoryPrefix)
    } else {
      parent.appendChild(createNode('pre', listing))
    }
  })
}

const updateTree = async (ipfs) => {
  const files = await loadFiles(ipfs, '/')
  const container = document.querySelector('#files')

  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }

  container.appendChild(createNode('pre', '/'))

  listFiles(container, files, '')
}

module.exports = {
  getSelected,
  updateTree
}
