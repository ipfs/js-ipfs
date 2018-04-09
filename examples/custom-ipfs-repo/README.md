# Customizing the IPFS Repo

> This example shows you how to customize your repository, including where your data is stored and how the repo locking is managed.

## Run this example

```
> npm install
> npm start
```

## Other Options

### Custom Repo Lock
> This example sets the repo locker to `false`, preventing any locking from happening. If you would like to control how locking happens, such as with a centralized S3 ipfs repo, you can pass in your own custom locker. See [custom-locker.js](./custom-locker.js) for an example of a custom locker that can be used for [datastore-s3](https://github.com/ipfs/js-datastore-s3).

```js
const S3Locker = require('./custom-locker')

const repo = new Repo('/tmp/.ipfs', {
  ...
  locker: new S3Locker(s3DatastoreInstance)
})
```