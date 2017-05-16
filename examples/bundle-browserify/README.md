# Bundle js-ipfs with Browserify!

> In this example, you will find a boilerplate you can use to guide yourself into bundling js-ipfs with browserify, so that you can use it in your own web app!

## Run this example

```bash
> npm install
> npm start
```

Now open your browser at `http://localhost:8888`

You should see the following:

![](https://ipfs.io/ipfs/QmNtpcWCEd6LjdPNfBFDaVZdD4jpgT8ZTAwoFJXKhYMJdo/1.png)
![](https://ipfs.io/ipfs/QmNtpcWCEd6LjdPNfBFDaVZdD4jpgT8ZTAwoFJXKhYMJdo/2.png)

## Special note

In order to use js-ipfs in the browser, you need to replace the default `zlib` library by `browserify-zlib-next`, a full implementation of the native `zlib` package, full in Node.js. 
See the package.json to learn how to do this and avoid this pitfall (see the `package.json`). More context on: https://github.com/ipfs/js-ipfs#use-in-the-browser-with-browserify-webpack-or-any-bundler
