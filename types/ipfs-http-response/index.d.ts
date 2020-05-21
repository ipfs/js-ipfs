// Type definitions for ipfs-http-response 0.5
// Project: https://github.com/ipfs/js-ipfs-http-response#readme
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export function getResponse(ipfsNode: any, ipfsPath: any): any;

export namespace resolver {
    function cid(ipfs: any, path: any): any;

    function directory(ipfs: any, path: any, cid: any): any;

    function multihash(ipfs: any, path: any): any;

}

