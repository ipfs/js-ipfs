'use strict'

const createNode = (type, content, attrbutes) => {
  attrbutes = attrbutes || {}

  const node = document.createElement(type)
  node.innerText = content

  Object.keys(attrbutes).forEach(attrbute => {
    if (attrbute === 'className') {
      node.className = attrbutes[attrbute]

      return
    }

    node.setAttribute(attrbute, attrbutes[attrbute])
  })

  return node
}

const log = (line) => {
  const output = document.querySelector('#log')
  let message
  let className = ''

  if (line instanceof Error) {
    className = 'error'
    message = `Error: ${line.message}`
  } else if (typeof line === 'string') {
    message = line
  } else {
    className = 'output'
    message = JSON.stringify(line, null, 2)
  }

  if (!message) {
    return
  }

  const node = createNode('p', message, {
    className
  })
  output.appendChild(node)
  output.scrollTop = output.offsetHeight

  return node
}

const dragDrop = (onFiles) => {
  const container = document.querySelector('#container')

  container.ondragover = (event) => {
    container.className = 'drag-over'
    event.preventDefault()
  }

  container.ondragleave = () => {
    container.className = ''
  }

  container.ondrop = (event) => {
    container.className = ''
    event.preventDefault()

    const files = Array.from(event.dataTransfer.items)
      .map(item => item.getAsFile())
      .filter(item => Boolean(item))

    if (files.length) {
      onFiles(files)
    }
  }
}

const bufferToArrayBuffer = (buffer) => {
  const ab = new ArrayBuffer(buffer.length)
  const view = new Uint8Array(ab)

  for (let i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i]
  }

  return ab
}

module.exports = {
  log,
  dragDrop,
  createNode,
  bufferToArrayBuffer
}
