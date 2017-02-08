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
    const peers = this.props.peers && this.props.peers.length > 0
      ? this.props.peers.map((e, idx) => {
        return (
          <div className='Peers-list'
            key={e}
            onClick={stopEventBubbling}>
            <div>{idx + 1}. {e}</div>
          </div>
        )
      })
      : <div className='Peers-list'><br/><br/><i>No peers for this feed</i></div>

    const swarm = this.props.swarm && this.props.swarm.length > 0
      ? this.props.swarm.map((e, idx) => {
        return (
          <div className='Peers-list'
            key={e}
            onClick={stopEventBubbling}>
            <div>{idx + 1}. {e.addr.toString()}</div>
          </div>
        )
      })
      : <div className='Peers-list'><br/><br/><i>Not connected to the swarm</i></div>


    return (
      <div className='Peers' onClick={this.props.onClick.bind(this)}>
        <h2>Peers Connected to this Feed</h2>
        {peers}
        <br />
        <br />
        <h2>Swarm</h2>
        {swarm}
        <br />
        <br />
        <h2>Connect to a Peer</h2>
        <br />
        <div className='Peers-connect' onClick={stopEventBubbling}>
          <input className='Peers-connect-input'
            type='text'
            ref='addr'
            placeholder='/ip4/0.0.0.0/tcp/9999/ws/ipfs/QmZGH8GeASSkSZoNLPEBu1MqtzLTERNUEwh9yTHLEF5kcW'
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
