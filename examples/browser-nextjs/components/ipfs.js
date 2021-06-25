import { useState, useEffect } from 'react'
import Ipfs from 'ipfs'

const IpfsComponent = () => {
  const [id, setId] = useState(null);
  const [ipfs, setIpfs] = useState(null);
  const [version, setVersion] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (ipfs) return

      const node = await Ipfs.create();

      const nodeId = await node.id();
      const nodeVersion = await node.version();
      const nodeIsOnline = node.isOnline;

      setIpfs(node);
      setId(nodeId.id);
      setVersion(nodeVersion.version);
      setIsOnline(nodeIsOnline);
    }

    init()
  }, [ipfs]);

  if (!ipfs) {
    return <h4>Connecting to IPFS...</h4>
  }

  return (
    <div id="ipfs">
      <h4>ID: {id}</h4>
      <h4>Version: {version}</h4>
      <h4 id="ipfs-status">Status: {isOnline ? 'Online' : 'Offline'}</h4>
    </div>
  )
}

export default IpfsComponent
