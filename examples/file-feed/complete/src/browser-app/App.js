import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import DataStore from './DataStore'
import Feed from './Feed'
import Preview from './Preview'
import Peers from './Peers'
import Status from './Status'
import { isMediaFile } from './utils'
import './App.css'

let dataStore

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      feed: null,
      files: [],
      status: null,
      preview: null,
      dragActive: false,
      showPeers: false
    }
  }

  componentDidMount () {
    // Set UI status message
    this.setStatus('Starting IPFS')

    // Initialize our DataStore, ie. start IPFS
    dataStore = DataStore.init({
      path: '/ipfs/' + new Date().toString(),
      signalAddr: '/dns4/star-signal.cloud.ipfs.team'
    })

    dataStore.on('error', (e) => console.error(e))
    dataStore.on('ready', () => {
      this.setStatus('IPFS Started', 5000)

      const feedName = this.props.params.hash
      if (feedName) {
        dataStore.on('feed', () => {
          this.setState({ feed: feedName })
          dataStore.ipfs.id()
            .then((id) => this.setStatus('Your Peer ID: ' + id.id))
        })
        dataStore.on('update', () => this.updateFiles())
        dataStore.on('file', () => this.setState({ dragActive: false }))
        dataStore.on('peers', (peers) => this.setState({ peers: peers }))
        this.setStatus('Loading database')
        dataStore.openFeed(feedName)
      }
    })
  }

  setStatus (text, timeout) {
    console.log(text)
    this.setState({ status: text })
    if (this.timer) clearTimeout(this.timer)
    if (timeout) {
      this.timer = setTimeout(() => this.setState({ status: null }), timeout)
    }
  }

  updateFiles () {
    let files = dataStore.feed.iterator({ limit: -1 })
      .collect()
      .slice()
      .reverse()
      .map((e) => e.payload.value)

    this.setState({ files: files })
  }

  openFile (hash, name, type, size) {
    const elmType = type.split('/')[0]
    const typeAsText = isMediaFile(elmType) || elmType === 'text' ? elmType : 'raw'
    console.log(`Render '${name}' as ${typeAsText} (${type})`)
    this.setState({
      preview: {
        hash: hash,
        type: elmType,
        name: name,
        size: size
      }
    })
  }

  closeFile () {
    this.setState({ preview: null })
  }

  showPeers (show) {
    this.setState({ showPeers: show })
  }

  connectTo (multiaddr) {
    dataStore.connectToPeer(multiaddr)
  }

  onDragEnter () {
    this.setState({ dragActive: true })
  }

  onDragLeave () {
    this.setState({ dragActive: false })
  }

  onDrop (files) {
    files.slice()
      .forEach((file) => dataStore.addFiles(file))
  }

  render () {
    const { feed, status, peers, files, preview, dragActive } = this.state

    const dropzone = dragActive
      ? <Dropzone
        className='App-dropzone'
        activeClassName='App-dropzoneActive'
        disableClick
        onDrop={this.onDrop.bind(this)}
        onDragLeave={this.onDragLeave.bind(this)}>
        <div ref='dropLabel'>Add files to '{this.state.feed}'</div>
      </Dropzone>
      : null

    const instructions = this.props.params && this.props.params.hash === undefined
        ? <div className='App-instructions'>
            Open a file drop by adding the a name to the URL, eg.<br />
          <a href='/hello-world'>http://localhost:3000/hello-world</a>
          <br />
            Share the link with others and once connected, <br />
            you'll be able to share files between you.
          </div>
        : null

    const feedElement = feed
      ? <Feed name={feed}
        peers={peers}
        files={files}
        onShowPeers={this.showPeers.bind(this, true)}
        onOpenFile={this.openFile.bind(this)} />
      : null

    const previewElement = preview
      ? <Preview hash={preview.hash}
        type={preview.type}
        name={preview.name}
        size={preview.size}
        onClick={this.closeFile.bind(this)} />
      : null

    const peersElement = this.state.showPeers
      ? <Peers peers={peers}
        onConnectTo={this.connectTo.bind(this)}
        onClick={this.showPeers.bind(this, false)} />
      : null

    return (
      <div
        className='App'
        onDragEnter={this.onDragEnter.bind(this)}>
        {previewElement}
        {peersElement}
        <h1>File Feed</h1>
        <h4>Synchronize series of files between browsers and Desktop with IPFS and OrbitDB</h4>
        <Status className='App-status' text={status} />
        {dropzone}
        {feedElement}
        {instructions}
      </div>
    )
  }
}

export default App
