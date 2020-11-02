# CORS <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->

- [Overview](#overview)
- [Configure CORS headers](#configure-cors-headers)

## Overview

Cross-origin Resource Sharing is a browser security mechanism that prevents unauthorized scripts from accessing resources from different domains.

By default the HTTP RPC API of js-IPFS will cause any request sent from a CORS-respecting browser to fail.

## Configure CORS headers

You can configure your node to allow requests from other domains to proceed by setting the appropriate headers in the node config:

```console
$ jsipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin  '["http://example.com"]'
$ jsipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
```

Restart the daemon for the settings to take effect.
