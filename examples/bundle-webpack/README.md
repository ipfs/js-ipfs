# Bundle js-ipfs with Webpack!

> In this example, you will find a boilerplate you can use to guide yourself into bundling js-ipfs with webpack, so that you can use it in your own web app!

## Run this example

Once the daemon is on, run the following commands within this folder:

```bash
> npm install
> npm start
```

Now open your browser at `http://localhost:3000`

You should see the following:

![](https://ipfs.io/ipfs/QmZndNLRct3co7h1yVB72S4qfwAwbq7DQghCpWpVQ45jSi/1.png)

## Special note

In order to use js-ipfs in the browser, you need to replace the default `zlib` library by `browserify-zlib-next`, a full implementation of the native `zlib` package, full in Node.js. See the WebPack config to learn how to do this and avoid this pitfall. More context on: https://github.com/ipfs/js-ipfs#use-in-the-browser-with-browserify-webpack-or-any-bundler

## Special note 2

You need to use WebPack@2 or above, version 1 won't work
