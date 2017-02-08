import React, { Component } from 'react'
import { getHumanReadableBytes, getFormattedTime } from './utils'
import './File.css'

class File extends Component {
  render () {
    const { name, hash, type, size, ts } = this.props.fileInfo
    return (
      <div className='File'
        key={hash + ts}
        onClick={this.props.onOpenFile.bind(this, hash, name, type, size)}>
        <span className='File-filename'>{name}</span>
        <span className='File-size'>{getHumanReadableBytes(size)}</span>
        <span className='File-timestamp'>{getFormattedTime(ts)}</span>
      </div>
    )
  }
}

export default File
