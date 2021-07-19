import { useState, useEffect } from 'react'
import dotProp from 'dot-prop'
// dot-prop: used to obtain a property of an object when the name of property is a string
// here we get ipfs.id when calling dotProp.get(ipfs, cmd), with cmd = 'id'
// and we get ipfs.hash when calling with cmd = 'hash' etc.

/*
 * Pass the command you'd like to call on an ipfs instance.
 *
 * callIpfs uses setState write the response as a state variable, so that your component
 * will re-render when the result 'res' turns up from the call await ipfsCmd.
 *
 */
export default function useIpfs (ipfs, cmd, opts) {
    // note: opts is not used here and is not passed as args of the call from App.js
    const [res, setRes] = useState(null)
    useEffect(() => {
        callIpfs(ipfs, cmd, opts, setRes)
    }, [ipfs, cmd, opts])
    return res
}

async function callIpfs (ipfs, cmd, opts, setRes) {
    if (!ipfs) return null
    console.log(`Call ipfs.${cmd}`)
    const ipfsCmd = dotProp.get(ipfs, cmd)
    const res = await ipfsCmd(opts)
    console.log(`Result ipfs.${cmd}`, res)
    setRes(res)
}
