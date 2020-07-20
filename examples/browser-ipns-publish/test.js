"use strict";

const path = require("path");
const execa = require("execa");
const { createFactory } = require("ipfsd-ctl");
const df = createFactory({
  ipfsHttpModule: require("ipfs-http-client"),
  ipfsBin: require("go-ipfs").path(),
  args: ["--enable-pubsub-experiment"],
  disposable: true,
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
    type: "go",
    test: true,
    ipfsOptions: {
      config: {
        Addresses: {
          API: "/ip4/127.0.0.1/tcp/0",
        },
        API: {
          HTTPHeaders: {
            "Access-Control-Allow-Origin": [app.url],
          },
        },
      },
    },
  });

  const go2 = await df.spawn({
    type: "go",
    test: true,
  });

  await go.api.swarm.connect(go2.api.peerId.addresses[0]);

  const topic = `/ipfs/QmWCnkCXYYPP7NgH6ZHQiQxw7LJAMjnAySdoz9i1oxD5XJ`;

  try {
    await testUI(
      app.url,
      go.apiAddr,
      go.api.peerId.addresses[0].toString(),
      topic
    );
  } finally {
    await go.stop();
    await go2.stop();
    await app.stop();
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
    .perform(() => {
      console.log(
        "process.env.IPFS_API_ADDRESS: ",
        process.env.IPFS_API_ADDRESS
      );
    })
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

  browser.expect.element("#console").text.to.contain(`IPNS Publish Success!`);

  browser.end();
};
