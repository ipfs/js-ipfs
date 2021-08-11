import Ipfs from 'ipfs'
// ipfs is the core API, a CLI and a HTTP server that functions as a HTTP to IPFS bridge
// and an RPC endpoint. See https://www.npmjs.com/package/ipfs
import { useEffect, useState } from 'react'

let ipfs = null

/*
 * A quick demo using React hooks to create an ipfs instance.
 *
 * Hooks are brand new at the time of writing, and this pattern
 * is intended to show it is possible. I don't know if it is wise.
 *
 * Next steps would be to store the ipfs instance on the context
 * so use-ipfs calls can grab it from there rather than expecting
 * it to be passed in.
 */
export default function useIpfsFactory () {
    // initialise state variables, React hooks
    const [isIpfsReady, setIpfsReady] = useState(Boolean(ipfs))
    const [ipfsInitError, setIpfsInitError] = useState(null)

    useEffect(() => {
        // useEffect -as used here- is equivalent to componentDidMount in old React
        // The hook useEffect should not return anything other than a cleanup fn,
        // in addition, in a true life application there are many other context init things
        // hence in this example we make only a call to an async that initialises IPFS
        startIpfs()
        // ... add here any other init fn as required by an application
        return function cleanup () {
            if (ipfs && ipfs.stop) {
                console.log('Stopping IPFS')
                ipfs.stop().catch(err => console.error(err))
                ipfs = null
                setIpfsReady(false)
            }
        }
    }, [])

    async function startIpfs () {
        // initialise IPFS daemon
        if (ipfs) {
            console.log('IPFS already started')
        } else {
            try {
                console.time('IPFS Started')    // start timer
                ipfs = await Ipfs.create()
                console.timeEnd('IPFS Started') // stop timer and log duration in console
            } catch (error) {
                console.error('IPFS init error:', error)
                ipfs = null
                setIpfsInitError(error)
            }
        }

        setIpfsReady(Boolean(ipfs))
    }

    return { ipfs, isIpfsReady, ipfsInitError }
}
