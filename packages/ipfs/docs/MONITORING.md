# Monitoring

The HTTP API exposed with js-ipfs can also be used for exposing metrics about the running js-ipfs node and other Node.js metrics.

To enable it, you need to set the environment variable `IPFS_MONITORING` (any value).  E.g.

```console
$ IPFS_MONITORING=true jsipfs daemon
```

Once the environment variable is set and the js-ipfs daemon is running, you can get the metrics (in prometheus format) by making a GET request to the following endpoint:

```
http://localhost:5002/debug/metrics/prometheus
```
