'use strict'

const React = require('react')
const IPFS = require('../../../../src/core') // replace this by line below
// const IPFS = require('ipfs')

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
  componentDidMount () {
    const self = this
    let node

    create()

    function create () {
      // Create the IPFS node instance

      // for simplicity, we create a new repo everytime the node
      // is created, because you can't init already existing repos
      const repoPath = String(Math.random())
      node = new IPFS({
        repo: repoPath,
        EXPERIMENTAL: {
          pubsub: false
        }
      })

      node.init({ emptyRepo: true, bits: 2048 }, function (err) {
        if (err) {
          throw err
        }
        node.load(function (err) {
          if (err) {
            throw err
          }

          node.goOnline(function (err) {
            if (err) {
              throw err
            }
            console.log('IPFS node is ready')
            ops()
          })
        })
      })
    }

    function ops () {
      node.id((err, res) => {
        if (err) {
          throw err
        }
        self.setState({
          id: res.id,
          version: res.agentVersion,
          protocol_version: res.protocolVersion
        })
      })

      node.files.add([new Buffer(stringToUse)], (err, res) => {
        if (err) {
          throw err
        }
        const hash = res[0].hash
        self.setState({added_file_hash: hash})
        node.files.cat(hash, (err, res) => {
          if (err) {
            throw err
          }
          let data = ''
          res.on('data', (d) => {
            data = data + d
          })
          res.on('end', () => {
            self.setState({added_file_contents: data})
          })
        })
      })
    }
  }
  render () {
    return (
      <div style={{textAlign: 'center'}}>
        <h1>Everything is working!</h1>
        <p>Your ID is <strong>{this.state.id}</strong></p>
        <p>Your IPFS version is <strong>{this.state.version}</strong></p>
        <p>Your IPFS protocol version is <strong>{this.state.protocol_version}</strong></p>
        <hr />
        <div>
          Added a file! <br />
          {this.state.added_file_hash}
        </div>
        <br />
        <br />
        <p>
          Contents of this file: <br />
          {this.state.added_file_contents}
        </p>
      </div>
    )
  }
}
module.exports = App
