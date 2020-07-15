'use strict'
const React = require('react')
const ipfsClient = require('ipfs-http-client')
const stringToUse = 'hello world from webpacked IPFS'

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addr: null,
      id: null,
      version: null,
      protocol_version: null,
      added_file_hash: null,
      added_file_contents: null
    }

    this.connect = this.connect.bind(this)
    this.multiaddr = React.createRef()
  }

  async connect () {
    const ipfs = ipfsClient(this.multiaddr.current.value)
    const id = await ipfs.id()

    this.setState({
      id: id.id,
      version: id.agentVersion,
      protocol_version: id.protocolVersion
    })

    const source = ipfs.add(stringToUse)
    for await (const file of source) {
      const hash = file.cid
      this.setState({ added_file_hash: hash.toString() })

      const source = ipfs.cat(hash)
      let contents = ''
      const decoder = new TextDecoder('utf-8')

      for await (const chunk of source) {
        contents += decoder.decode(chunk, {
          stream: true
        })
      }

      contents += decoder.decode()

      this.setState({ added_file_contents: contents })
    }
  }

  render () {
    if (this.state.id) {
      return (
        <div style={{ textAlign: 'center' }}>
          <h1 id="info-header">Everything is working!</h1>
          <p>Your ID is <strong>{this.state.id}</strong></p>
          <p>Your IPFS version is <strong>{this.state.version}</strong></p>
          <p>Your IPFS protocol version is <strong>{this.state.protocol_version}</strong></p>
          <div>
            <div>
              Added a file! <br />
              {this.state.added_file_hash}
            </div>
            <div>
              Contents of this file: <br />
              {this.state.added_file_contents}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div style={{ textAlign: 'center' }}>
        <h1 id="connect-header">Enter the multiaddr for an IPFS node HTTP API</h1>
        <form>
          <input id="connect-input" type="text" defaultValue="/ip4/127.0.0.1/tcp/5001" ref={this.multiaddr} />
          <input id="connect-submit" type="button" value="Connect" onClick={this.connect} />
        </form>
      </div>
    )

  }
}
module.exports = App
