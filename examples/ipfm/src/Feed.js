import React, { Component } from 'react'
import File from './File'
import { toFileInfo } from './utils'
import './Feed.css'

class Feed extends Component {
  render() {
    const { name, files, peers, onOpenFile } = this.props

    const filesList = files.length > 0 
      ? files.map((e) => {
          const fileInfo = toFileInfo(e)
          return <File key={fileInfo.hash + fileInfo.ts}
                       fileInfo={fileInfo}
                       onOpenFile={onOpenFile}/>
        })
      : <div className='Feed-empty'>
          This feed is empty.
        </div>

    const peerCount = peers ? peers.length : 0
    const peerCounter = peers && peerCount > 0
      ? <span>{peerCount} {peerCount === 1 ? 'peer' : 'peers'}</span>
      : <span><i>Searching for peers...</i></span>

    return (
      <div className='Feed'>
        <div className='Feed-title'>
          <h2>{name}</h2>
          {peerCounter}
        </div>
        <div id='files' className='Feed-files'>
          {filesList}
        </div>
        <div className='Feed-instructions'>
          Drop files here to add them to this feed.
        </div>
      </div>
    )
  }
}

export default Feed
