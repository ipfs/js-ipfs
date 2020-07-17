'use strict'

const React = require('react')
const IPFS = require('ipfs')

const stringToUse = 'hello world from webpacked IPFS'

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      id: null,
      agentVersion: null,
      protocolVersion: null,
      addedFileHash: null,
      addedFileContents: null
    }
  }

  componentDidMount () {
    this.ops()
  }

  async ops () {
    const node = await IPFS.create({ repo: String(Math.random() + Date.now()) })

    console.log('IPFS node is ready')

    const { id, agentVersion, protocolVersion } = await node.id()

    this.setState({ id, agentVersion, protocolVersion })

    const { cid } = await node.add(stringToUse)
    this.setState({ addedFileHash: cid.toString() })

    let bufs = []

    for await (const buf of node.cat(cid)) {
      bufs.push(buf)
    }

    const data = Buffer.concat(bufs)
    this.setState({ addedFileContents: data.toString('utf8') })
  }

  render () {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1>Everything is working!</h1>
        <p>Your ID is <strong>{this.state.id}</strong></p>
        <p>Your IPFS version is <strong>{this.state.agentVersion}</strong></p>
        <p>Your IPFS protocol version is <strong>{this.state.protocolVersion}</strong></p>
        <hr />
        <div>
          Added a file! <br />
          {this.state.addedFileHash}
        </div>
        <br />
        <br />
        <p>
          Contents of this file: <br />
          {this.state.addedFileContents}
        </p>
      </div>
    )
  }
}
module.exports = App
