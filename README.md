IPFS API via NodeJS
===================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs) [![Dependency Status](https://david-dm.org/ipfs/node-ipfs-api.svg?style=flat-square)](https://david-dm.org/ipfs/node-ipfs-api)

> A client library for the IPFS API.

# Usage

### Note: non browserify users

If you're NOT using browserify, then use the included standalone file ipfsapi.min.js. This exports a ipfsAPI constructor on window.

### Installing 

Install Via NPM:
```bash
$ npm install --save ipfs-api
```

Initialize with:
```javascript
//load module
var ipfs_api = require('ipfs-api');

//connect to ipfs daemon API server
var ipfs = ipfs_api('localhost', '5001'); //leaving out the arguments will default to these values
```

### CORS Error Note
If are using this module in a browser with something like browserify, then you will get an error saying that the origin is not allowed.  This would be a CORS ("Cross Origin Resource Sharing") failure. The ipfs server rejects requests from unknown domains by default.  You can whitelist the domain that you are calling from by exporting API_ORIGIN and restarting the daemon, like:

```bash
export API_ORIGIN="http://localhost:8080"
ipfs daemon
```

## Level 1 Commands
Level 1 commands are simple commands

### Add
Add a file (where file is any data) to ipfs returning the hash and name. The
name value will only be set if you are actually sending a file. A single or
array of files can be used.

**Usage**
```javascript
ipfs.add(files, function(err, res) {
    if(err || !res) return console.error(err)
    
    res.forEach(function(file) {
        console.log(file.Hash)
        console.log(file.Name)
    })
})
```
`files` can be a mixed array of filenames or buffers of data. A single value is
also acceptable.

Example
```
var files = ["../files/hello.txt", new Buffer("ipfs!")]
var files = "../files/hello.txt"
```

**Curl**
```
curl 'http://localhost:5001/api/v0/add?stream-cannels=true' \
-H 'content-type: multipart/form-data; boundary=a831rwxi1a3gzaorw1w2z49dlsor' \
-H 'Connection: keep-alive' \
--data-binary $'--a831rwxi1a3gzaorw1w2z49dlsor\r\nContent-Type: application/octet-stream\r\nContent-Disposition: file; name="file"; filename="Hello.txt"\r\n\r\nhello--a831rwxi1a3gzaorw1w2z49dlsor--' --compressed
```

**Response**
```
[{
    Hash: string,
    Name: string
}, ...]
```
*The name value will only be set for actual files*



### cat
Retrieve the contents of a single, or array of hashes

**Usage**
```javascript
ipfs.cat(hashs, function(err, res) {
    if(err || !res) return console.error(err)
    
    if(res.readable) {
        // Returned as a stream
        res.pipe(process.stdout)
    } else {
        // Returned as a string
        console.log(res)
    }
})
```

**Curl**
```
curl "http://localhost:5001/api/v0/cat?arg=<hash>&stream-channels=true"
```

**Response**

The response is either a readable stream, or a string.

### ls
Get the node structure of a hash, included in it is a hash and array to links.

**Usage**
```javascript
ipfs.ls(hashs, function(err, res) {
    if(err || !res) return console.error(err)
    
    res.Objects.forEach(function(node) {
        console.log(node.Hash)
        console.log("Links [%d]", node.Links.length)
        node.Links.forEach(function(link, i) {
            console.log("[%d]", i, link)
        })
    })
})
```

**Curl**
```
curl "http://localhost:5001/api/v0/ls?arg=<hash>&stream-channels=true"
```

**Response**
```
{
    Objects: [
        { 
            Hash: string,
            Links: [{
                Name: string,
                Hash: string,
                Size: number
            }, ...]
        },
        ....
    ]
}
```


**version**

**commands**

## Level 2 Commands
Level 2 commands are simply named spaced wrapped commands

### Config

### Update

### Mount

### Diag

### Block

### Object
**Curl**
```
curl 'http://localhost:5001/api/v0/object/get?arg=QmYEqnfCZp7a39Gxrgyv3qRS4MoCTGjegKV6zroU3Rvr52&stream-channels=true' --compressed
```

**Response**
```
{
    Links: [{
        Name: string,
        Hash: string,
        Size: number
    }, ...],
    Data: string
```
*Data is base64 encoded*

### Swarm

### Pin

### Gateway
