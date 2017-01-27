import React, { Component } from 'react'
import DataStore from './DataStore'
import { isMediaFile } from './utils'
import './Preview.css'

let dataStore

class Preview extends Component {
  constructor (props) {
    super(props)
    this.state = {
      data: null,
      progress: 'Loading...'
    }
    // Get a DataStore instance (singleton across the app)
    dataStore = DataStore.init()
    this.handleLoadProgress = this.handleLoadProgress.bind(this)
  }

  componentDidMount () {
    if (!this.props.hash) throw new Error('Hash not passed as a prop')

    dataStore.on('load', this.handleLoadProgress)

    dataStore.getFile(this.props.hash)
      .then((content) => {
        const data = isMediaFile(this.props.type)
          ? URL.createObjectURL(new Blob(content))
          : content.map((e) => e.toString()).join('')

        // Set the content for this preview
        this.setState({ data: data })
      })
      .catch((e) => console.error(e))
  }

  componentWillUnmount () {
    dataStore.removeListener('load', this.handleLoadProgress)
  }

  handleLoadProgress (hash, bytes) {
    const percentage = Math.ceil(bytes / this.props.size * 100)
    const progress = this.props.size > 10000 || percentage === 100
      ? 'Loading ' + percentage + '%'
      : this.state.progress

    this.setState({ progress: progress })
  }

  render () {
    let output
    const { name, hash, type, onClick } = this.props
    const src = this.state.data
    const progress = this.state.progress

    const stopEventBubbling = (e) => {
      e.stopPropagation()
      e.preventDefault()
    }

    if (type === 'image') {
      output = <img style={{ maxWidth: '90%', maxHeight: '80%' }}
        src={src}
        alt='' />
    } else if (type === 'audio') {
      output = <audio style={{ width: '60%', maxHeight: '80%' }}
        src={src}
        controls
        autoPlay
        onClick={stopEventBubbling} />
    } else if (type === 'video') {
      output = <video style={{ maxWidth: '90%', maxHeight: '80%' }}
        src={src}
        controls
        autoPlay
        onClick={stopEventBubbling} />
    } else {
      output = this.state.data
        ? <pre className='Preview-content' style={{ width: '80%' }}>{src}</pre>
        : null
    }

    const statusText = !src
      ? <div className='Preview-loading'><br />{progress}</div>
      : <div className='Preview-info'>
        <span>{name}</span>
        <span>{hash}</span>
      </div>

    return (
      <div className='Preview' onClick={onClick}>
        {statusText}
        {output}
      </div>
    )
  }
}

export default Preview
