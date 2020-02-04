'use strict'
const React = require('react')
const ipfsClient = require('ipfs-http-client')

const ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')
const stringToUse = 'hello world from webpacked IPFS'

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      id: null,
      version: null,
      protocol_version: null,
      added_file_hash: null,
      added_file_contents: null
    }
  }
  async componentDidMount () {
    const id = await ipfs.id()
    this.setState({
      id: id.id,
      version: id.agentVersion,
      protocol_version: id.protocolVersion
    })

    const source = ipfs.add(stringToUse)
    for await (const file of source) {
      console.log("TCL: App -> forawait -> file", file)
      const hash = file.path
      this.setState({ added_file_hash: hash })

      const source = ipfs.cat(hash)
      const data = []
      for await (const chunk of source) {
        data.push(chunk)
      }
      this.setState({ added_file_contents: Buffer.concat(data).toString() })
    }
  }
  render () {
    return <div style={{ textAlign: 'center' }}>
      <h1>Everything is working!</h1>
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
  }
}
module.exports = App
