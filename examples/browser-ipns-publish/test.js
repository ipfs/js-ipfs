"use strict";

const path = require("path");
const execa = require("execa");
const { createFactory } = require("ipfsd-ctl");
const df = createFactory({
  ipfsHttpModule: require("ipfs-http-client"),
  ipfsBin: require("go-ipfs").path(),
  args: [
    "--enable-pubsub-experiment",
    '--enable-namesys-pubsub'
  ],
  test: true
});
const { startServer } = require("test-ipfs-example/utils");
const pkg = require("./package.json");

async function testUI(url, apiAddr, peerAddr, topic) {
  const proc = execa(
    require.resolve("test-ipfs-example/node_modules/.bin/nightwatch"),
    [
      "--config",
      require.resolve("test-ipfs-example/nightwatch.conf.js"),
      path.join(__dirname, "test.js"),
    ],
    {
      cwd: path.resolve(__dirname, "../"),
      env: {
        ...process.env,
        CI: true,
        IPFS_EXAMPLE_TEST_URL: url,
        IPFS_API_ADDRESS: apiAddr,
        IPFS_PEER_ADDRESS: peerAddr,
        IPFS_TOPIC: topic,
      },
      all: true,
    }
  );
  proc.all.on("data", (data) => {
    process.stdout.write(data);
  });

  await proc;
}

async function runTest() {
  const app = await startServer(__dirname);
  const go = await df.spawn({
    ipfsOptions: {
      config: {
        Addresses: {
          API: "/ip4/127.0.0.1/tcp/0",
          Swarm: [
            "/ip4/127.0.0.1/tcp/0/ws"
          ]
        },
        API: {
          HTTPHeaders: {
            "Access-Control-Allow-Origin": [app.url],
          },
        },
      },
    },
  });

  const go2 = await df.spawn();
  await go.api.swarm.connect(go2.api.peerId.addresses[0]);

  const { cid } = await go.api.add(`Some data ${Date.now()}`)
  const topic = `/ipfs/${cid}`;

  const peerAddr = go.api.peerId.addresses
    .map(addr => addr.toString())
    .filter(addr => addr.includes("/ws/p2p/"))
    .pop()

  try {
    await testUI(
      app.url,
      go.apiAddr,
      peerAddr,
      topic
    );
  } finally {
    await app.stop();
    await df.clean();
  }
}

module.exports = runTest;

module.exports[pkg.name] = function (browser) {
  const apiSelector = "#api-url:enabled";

  // connect to the API
  browser
    .url(process.env.IPFS_EXAMPLE_TEST_URL)
    .waitForElementVisible(apiSelector)
    .clearValue(apiSelector)
    .setValue(apiSelector, process.env.IPFS_API_ADDRESS)
    .pause(1000)
    .click("#node-connect");

  browser.expect
    .element("#console")
    .text.to.contain(`Connecting to ${process.env.IPFS_API_ADDRESS}\nSuccess!`);

  // connect via websocket
  const peerAddrSelector = "#peer-addr:enabled";
  browser
    .waitForElementVisible(peerAddrSelector)
    .clearValue(peerAddrSelector)
    .setValue(peerAddrSelector, process.env.IPFS_PEER_ADDRESS)
    .pause(1000)
    .click("#peer-connect");

  browser.expect
    .element("#console")
    .text.to.contain(
      `Connecting to peer ${process.env.IPFS_PEER_ADDRESS}\nSuccess!`
    );

  // publish to IPNS
  const publishSelector = "#topic:enabled";
  browser
    .waitForElementVisible(publishSelector)
    .clearValue(publishSelector)
    .setValue(publishSelector, process.env.IPFS_TOPIC)
    .pause(1000)
    .click("#publish");

  browser.expect.element("#console").text.to.contain('Publish to IPNS');
  browser.expect.element("#console").text.to.contain('Initial Resolve');
  browser.expect.element("#console").text.to.contain('Published');
  browser.expect.element("#console").text.to.contain(`IPNS Publish Success!`);

  browser.end();
};
