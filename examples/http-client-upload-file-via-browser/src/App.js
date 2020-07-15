/* eslint-disable no-console */
'use strict'

const React = require('react')
const ipfsClient = require('ipfs-http-client')

class App extends React.Component {
  constructor () {
    super()
    this.state = {
      added_file_hash: null
    }

    // bind methods
    this.captureFile = this.captureFile.bind(this)
    this.saveToIpfs = this.saveToIpfs.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.connect = this.connect.bind(this)
    this.multiaddr = React.createRef()
  }

  captureFile (event) {
    event.stopPropagation()
    event.preventDefault()
    if (document.getElementById('keep-filename').checked) {
      this.saveToIpfsWithFilename(event.target.files)
    } else {
      this.saveToIpfs(event.target.files)
    }
  }

  // Example #1
  // Add file to IPFS and return a CID
  async saveToIpfs (files) {
    const source = this.state.ipfs.add(
      [...files],
      {
        progress: (prog) => console.log(`received: ${prog}`)
      }
    )
    try {
      for await (const file of source) {
        console.log(file)
        this.setState({ added_file_hash: file.path })
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Example #2
  // Add file to IPFS and wrap it in a directory to keep the original filename
  async saveToIpfsWithFilename (files) {
    const file = [...files][0]
    const fileDetails = {
      path: file.name,
      content: file
    }
    const options = {
      wrapWithDirectory: true,
      progress: (prog) => console.log(`received: ${prog}`)
    }

    const source = this.state.ipfs.add(fileDetails, options)
    try {
      for await (const file of source) {
        console.log(file)
        this.setState({ added_file_hash: file.cid.toString() })
      }
    } catch (err) {
      console.error(err)
    }
  }

  handleSubmit (event) {
    event.preventDefault()
  }

  async connect () {
    this.setState({
      ipfs: ipfsClient(this.multiaddr.current.value)
    })
  }

  render () {
    if (this.state.ipfs) {
      return (
        <div>
          <form id='capture-media' onSubmit={this.handleSubmit}>
            <input type='file' name='input-file' id='input-file' onChange={this.captureFile} /><br/>
            <label htmlFor='keep-filename'><input type='checkbox' id='keep-filename' name='keep-filename' /> keep filename</label>
          </form>
          <div>
            <a id="gateway-link" target='_blank'
              href={'https://ipfs.io/ipfs/' + this.state.added_file_hash}>
              {this.state.added_file_hash}
            </a>
          </div>
        </div>
      )
    }

    return (
      <div style={{ textAlign: 'center' }}>
        <h1>Enter the multiaddr for an IPFS node HTTP API</h1>
        <form>
          <input id="connect-input" type="text" defaultValue="/ip4/127.0.0.1/tcp/5001" ref={this.multiaddr} />
          <input id="connect-submit" type="button" value="Connect" onClick={this.connect} />
        </form>
      </div>
    )
  }
}
module.exports = App
