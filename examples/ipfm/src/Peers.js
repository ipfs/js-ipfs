import React, { Component } from 'react'
import './Peers.css'

const stopEventBubbling = (e) => {
  e.stopPropagation()
  e.preventDefault()
}

class Peers extends Component {
  render () {
    const peers = this.props.peers 
      ? this.props.peers.map((e, idx) => {
        // PeerId.toJSON()
        // https://github.com/libp2p/js-peer-id/blob/3ef704ba32a97a9da26a1f821702cdd3f09c778f/src/index.js#L106
        // Multiaddr.toString()
        // https://multiformats.github.io/js-multiaddr/#multiaddrtostring      
        const id = e.peer.id.toJSON().id
        return (
          <div className='Peers-list' 
               key={id} 
               onClick={stopEventBubbling}>
            <div>{idx + 1}. {id}</div>
            <div>{e.addr.toString()}</div>
            <br/>
          </div>
        )
      })
      : null

    return (
      <div className='Peers' onClick={this.props.onClick.bind(this)}>
        <h2>Connected Peers</h2>
        {peers}
      </div>
    )
  }
}

export default Peers
