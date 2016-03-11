# API

## Usage

We classify the API calls by 'core', 'extensions', 'tooling', and 'network', following the same API spec organization available at [ipfs/specs](https://github.com/ipfs/specs/tree/master/api).

The tests folder also contains great examples that can be used to understand how this client library interacts with the HTTP-API. You can find the [tests here](tests/api).

### Core

##### version

- [examples](https://github.com/ipfs/js-ipfs-api/blob/master/test/api/version.spec.js)

##### node

> node start and stop are not implemented in the API

- [examples](https://github.com/ipfs/js-ipfs-api/blob/master/test/api/id.spec.js)

##### block

- [examples](https://github.com/ipfs/js-ipfs-api/blob/master/test/api/block.spec.js)

##### object

*curl*
```sh
curl 'http://localhost:5001/api/v0/object/get?arg=QmYEqnfCZp7a39Gxrgyv3qRS4MoCTGjegKV6zroU3Rvr52&stream-channels=true' --compressed
```

*response*
```js
{
    Links: [{
        Name: string,
        Hash: string,
        Size: number
    }, ...],
    Data: string
}
```
*Data is base64 encoded.*

- [examples](https://github.com/ipfs/js-ipfs-api/blob/master/test/api/object.spec.js)

##### pin


-------------------------------------------------------

### Extensions


-------------------------------------------------------

### Tooling

##### add

Add a file (where file is any data) to ipfs returning the hash and name. The
name value will only be set if you are actually sending a file. A single or
array of files can be used.

*usage*
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
```js
var files = ["../files/hello.txt", new Buffer("ipfs!")]
var files = "../files/hello.txt"
```

*curl*
```sh
curl 'http://localhost:5001/api/v0/add?stream-channels=true' \
-H 'content-type: multipart/form-data; boundary=a831rwxi1a3gzaorw1w2z49dlsor' \
-H 'Connection: keep-alive' \
--data-binary $'--a831rwxi1a3gzaorw1w2z49dlsor\r\nContent-Type: application/octet-stream\r\nContent-Disposition: file; name="file"; filename="Hello.txt"\r\n\r\nhello--a831rwxi1a3gzaorw1w2z49dlsor--' --compressed
```

*response*
```js
[{
    Hash: string,
    Name: string
}, ...]
```
*The name value will only be set for actual files.*

##### cat

Retrieve the contents of a single hash, or array of hashes.

**usage**

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

*curl*

```sh
curl "http://localhost:5001/api/v0/cat?arg=<hash>&stream-channels=true"
```

*response*

The response is either a readable stream, or a string.

##### ls
Get the node structure of a hash. Included in it is a hash and array to links.

*Usage*
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

*Curl*
```sh
curl "http://localhost:5001/api/v0/ls?arg=<hash>&stream-channels=true"
```

*Response*
```js
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

##### update

-------------------------------------------------------

### Network


---------

#### Files

##### mkdir

```JavaScript
ipfs.files.mkdir(<folderName>, function (err) {})
```

##### cp

```JavaScript
ipfs.files.cp([<pathSrc>, <pathDst>], function (err) {})
```

##### ls

```JavaScript
ipfs.files.ls(<path>, function (err, res) {})
```

##### stat

```JavaScript
ipfs.files.stat(<path>, function (err, res) {})
```

##### rm

```JavaScript
ipfs.files.rm(<path>, [<options>],  function (err) {})
```

For `rm -r` pass a options obj with `r: true`

##### read

```JavaScript
ipfs.files.read(<path>, function (err, res) {
  if(res.readable) {
    // Returned as a stream
    res.pipe(process.stdout)
  } else {
    // Returned as a string
    console.log(res)
  }
})
```

##### write

##### mv

```JavaScript
ipfs.files.mv([<pathSrc>, <pathDst>], function (err) {})
```

response: (it returns empty when successful)

##### cp

```JavaScript
ipfs.files.cp([<pathSrc>, <pathDst>], function (err) {})
```

##### ls

```JavaScript
ipfs.files.ls(<path>, function (err, res) {})
```

##### stat

```JavaScript
ipfs.files.stat(<path>, function (err, res) {})
```

##### rm

```JavaScript
ipfs.files.rm(<path>, [<options>],  function (err) {})
```

For `rm -r` pass a options obj with `r: true`

##### read

```JavaScript
ipfs.files.read(<path>, function (err, res) {
  if(res.readable) {
    // Returned as a stream
    res.pipe(process.stdout)
  } else {
    // Returned as a string
    console.log(res)
  }
})
```

##### write

##### mv
curl "http://localhost:5001/api/v0/files/mkdir?arg=%2Ffolder4"

```JavaScript
ipfs.files.mv([<pathSrc>, <pathDst>], function (err) {})
