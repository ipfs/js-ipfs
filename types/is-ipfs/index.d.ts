// Type definitions for is-ipfs 1.0
// Project: https://github.com/ipfs/is-ipfs
// Definitions by: Irakli Gozalishvili <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export const pathGatewayPattern: RegExp;

export const pathPattern: RegExp;

export const subdomainGatewayPattern: RegExp;

export function base32cid(cid: any): void;

export function cid(hash: any): any;

export function cidPath(path: any): void;

export function ipfsPath(path: any): void;

export function ipfsSubdomain(url: any): void;

export function ipfsUrl(url: any): void;

export function ipnsPath(path: any): path is string;

export function ipnsSubdomain(url: any): void;

export function ipnsUrl(url: any): void;

export function multiaddr(input: any): any;

export function multihash(hash: any): any;

export function path(path: any): path is string;

export function peerMultiaddr(input: any): any;

export function subdomain(url: any): void;

export function url(url: any): void;

export function urlOrPath(x: any): void;

