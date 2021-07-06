'use strict'

const IPFS = require('ipfs')

const App = () => {
  let ipfs

  const DOM = {
    output: () => document.getElementById('output'),
    fileName: () => document.getElementById('file-name'),
    fileContent: () => document.getElementById('file-content'),
    addBtn: () => document.getElementById('add-submit'),
    terminal: () => document.getElementById('terminal')
  }

  const COLORS = {
    active: '#357edd',
    success: '#0cb892',
    error: '#ea5037'
  }

  const scrollToBottom = () => {
    const terminal = DOM.terminal()
    terminal.scroll({ top: terminal.scrollHeight, behavior: 'smooth' })
  }

  const showStatus = (text, bg, id = null) => {
    let log = DOM.output()

    if (!log) {
      const output = document.createElement('div')
      output.id = 'output'
      DOM.terminal().appendChild(output)

      log = DOM.output()
    }

    const line = document.createElement('p')
    line.innerText = text
    line.style.color = bg

    if (id) {
      line.id = id
    }

    log.appendChild(line)

    scrollToBottom(log)
  }

  const cat = async (cid) => {
    const content = []

    for await (const chunk of ipfs.cat(cid)) {
      content.push(chunk)
    }

    return content
  }

  const store = async (name, content) => {
    if (!ipfs) {
      showStatus('Creating IPFS node...', COLORS.active)

      ipfs = await IPFS.create({
        repo: String(Math.random() + Date.now()),
        init: { alogorithm: 'ed25519' }
      })
    }

    const id = await ipfs.id()
    showStatus(`Connecting to ${id.id}...`, COLORS.active, id.id)

    const fileToAdd = {
      path: `${name}`,
      content: content
    }

    showStatus(`Adding file ${fileToAdd.path}...`, COLORS.active)
    const file = await ipfs.add(fileToAdd)

    showStatus(`Added to ${file.cid}`, COLORS.success, file.cid)

    showStatus('Reading file...', COLORS.active)

    const text = await cat(file.cid)

    showStatus(`\u2514\u2500 ${file.path} ${text.toString()}`)
    showStatus(`Preview: https://ipfs.io/ipfs/${file.cid}`, COLORS.success)
  }

  // Event listeners
  DOM.addBtn().onclick = async (e) => {
    e.preventDefault()
    let name = DOM.fileName().value
    let content = DOM.fileContent().value

    try {
      if (name == null || name.trim() === '') {
        showStatus('Set default name', COLORS.active)
        name = 'test.txt'
      }

      if ((content == null || content.trim() === '')) {
        showStatus('Set default content', COLORS.active)
        content = 'Hello world!'
      }

      await store(name, content)
    } catch (err) {
      showStatus(err.message, COLORS.error)
    }
  }
}

App()
