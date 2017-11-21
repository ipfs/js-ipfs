# Streaming video in the browser with js-ipfs and hls.js

This example shows a method for video/audio streaming in the browser over IPFS.

## Why use HLS?

HLS (Apple's HTTP Live Streaming) is one of several protocols currently available for adaptive bitrate streaming.

One of the advantages of HLS over some other streaming technologies is that the content can be hosted on a plain old web server without any special server-side support. The way this works is that the original content (the stream or video/audio file) is split up into small MPEG2-TS segments before being uploaded to the server. The segments are then fetched by the HLS player on the fly (using regular HTTP GET requests) and get spliced together to a continuous stream.

In addition to the segments there are also so-called manifests (m3u8 files) which contain metadata about segments and their bitrates. A stream can contain segments of multiple bitrates and the HLS player will automatically switch to the optimal bitrate based on client performance.

The fact that HLS content is just "a bunch of files" makes it a good choice for IPFS (another protocol that works this way is MPEG-DASH, which could certainly be a good choice as well). Furthermore, the [hls.js](https://github.com/video-dev/hls.js) library enables straightforward integration with the HTML5 video element.

## hlsjs-ipfs-loader

The hls.js library ships with an HTTP based content loader only, but it's fortunately possible to configure custom content loaders as well, which is what makes IPFS streaming possible in this case. A loader implementation that fetches content using js-ipfs can be found [here](https://www.npmjs.com/package/hlsjs-ipfs-loader), and is easy to use on a regular HTML page:

```html
<script src="https://unpkg.com/ipfs/dist/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<script src="https://unpkg.com/hlsjs-ipfs-loader@0.1.1/dist/index.js"></script>
```

## Generating HLS content

In order for any of the above to be useful, we also need to have a way to actually generate HLS manifests and MPEG2-TS segments from an arbitrary video/audio file. Luckily, most new builds of `ffmpeg` are compiled with this capability.

For example, say we have a directory containing a video file `BigBuckBunny_320x180.mp4`. We can then create a sub directory and generate the HLS data there, and finally add it to IPFS:

```bash
> mkdir hls-bunny
> cd hls-bunny
> ffmpeg -i ../BigBuckBunny_320x180.mp4 -profile:v baseline -level 3.0 -start_number 0 -hls_time 5 -hls_list_size 0 -f hls master.m3u8
> ipfs add -Qr .
```

The most important piece of information to note down is the name you choose for the HLS manifest (master.m3u8 in this example, but you're free to use any name), and the hash returned by `ipfs add`. Consult [streaming.js](streaming.js) for a full example of how these values are used.

## Putting it all together

For a demo of the final result, see https://ipfs.io/ipfs/QmdBZhDLEsooVKkmgRgNzjo2JirSbddp8FvnccJ4c2orH2/

*Note:* If you try to run the example straight from disk, some browsers (e.g Chrome) might, for security reasons, prevent some resources from loading correctly. To get around this, simply cd into the directory of this example and use http-server from npm:

```bash
> npm install -g http-server
> http-server
```

You should then be able to stream Big Buck Bunny by pointing your browser at http://localhost:8080.

In addition to video streaming, plain audio streaming works fine as well. Simply use the same ffmpeg + ipfs procedure as described above, but with your audio file as input. You may also want to change the video tag to `audio` (video tags will play plain audio as well, but the player looks a bit strange).

On a final note, without diving too deep into what the specific ffmpeg HLS options above mean, it's worth mentioning the `hls_time` option, which defines the length of each HLS chunk (in seconds) and is potentially interesting for performance tuning (see for example [this article](https://bitmovin.com/mpeg-dash-hls-segment-length/)).

