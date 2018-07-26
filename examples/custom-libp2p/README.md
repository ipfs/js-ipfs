# Customizing the libp2p node

This example shows you how to make full use of the ipfs configuration to create a libp2p generator function. As IPFS applications become more complex, their needs for a custom libp2p node also grow. Instead of fighting with configuration options, you can use your own libp2p generator to get exactly what you need. This example shows you how.

## Run this example

Running this example should result in metrics being logged out to the console every few seconds.

```
> npm install
> npm start
```

## Play with the configuration!

With the metrics for peers and bandwidth stats being logged out, try playing around with the nodes configuration to see what kind of metrics you can get. How many peers are you getting? What does your bandwidth look like?

This is also a good opportunity to explore the various stats that ipfs offers! Not seeing a statistic you think would be useful? We'd love to have you [contribute](https://github.com/ipfs/js-ipfs/blob/master/CONTRIBUTING.md)!
