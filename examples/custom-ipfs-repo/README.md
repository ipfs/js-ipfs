# Customizing the IPFS Repo

This example shows you how to customize your repository, including where your data is stored and how the repo locking is managed. Customizing your repo makes it easier to extend IPFS for your particular needs. You may want to customize your repo if:

* If you want to store data somewhere that’s not on your local disk, like S3, a Redis instance, a different machine on your local network, or in your own database system, like MongoDB or Postgres, you might use a custom datastore.
* If you have multiple browser windows or workers sharing the same IPFS storage, you might want to use a custom lock to coordinate between them. (Locking is currently only used to ensure a single IPFS instance can access a repo at a time. This check is done on `repo.open()`. A more complex lock, coupled with a custom datastore, could allow for safe writes to a single datastore from multiple IPFS nodes.)

You can find full details on customization in the [IPFS Repo Docs](https://github.com/ipfs/js-ipfs-repo#setup).

## Run this example

```
> npm install
> npm start
```

## Other Options

### Custom Repo Lock
This example uses one of the locks that comes with IPFS Repo. If you would like to control how locking happens, such as with a centralized S3 IPFS Repo, you can pass in your own custom lock. See [custom-lock.js](./custom-lock.js) for an example of a custom lock that can be used for [datastore-s3](https://github.com/ipfs/js-datastore-s3).

```js
const S3Lock = require('./custom-lock')

const repo = new Repo('/tmp/.ipfs', {
  ...
  lock: new S3Lock(s3DatastoreInstance)
})
```