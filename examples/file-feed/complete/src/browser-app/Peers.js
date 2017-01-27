import React, { Component } from 'react'
import './Peers.css'

const stopEventBubbling = (e) => {
  e.stopPropagation()
  e.preventDefault()
}

class Peers extends Component {
  connect () {
    const addr = this.refs.addr.value
    this.props.onConnectTo(addr)
  }

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
            <br />
          </div>
        )
      })
      : null

    return (
      <div className='Peers' onClick={this.props.onClick.bind(this)}>
        <h2>Connected Peers</h2>
        {peers}
        <br />
        <br />
        <h2>Connect to a Peer</h2>
        <div onClick={stopEventBubbling}>
          <input className='Peers-connect-input'
            type='text'
            ref='addr'
            placeholder='/ip4/127.0.0.1/tcp/9999/ws/ipfs/QmZGH8GeASSkSZoNLPEBu1MqtzLTERNUEwh9yTHLEF5kcW'
                 />
          <input className='Peers-connect-button'
            type='button'
            value='Connect'
            onClick={this.connect.bind(this)}
                 />
        </div>
      </div>
    )
  }
}

export default Peers
