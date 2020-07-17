"use strict";

const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const execa = require("execa");
const delay = require("delay");
const { startServer } = require("test-ipfs-example/utils");
const pkg = require("./package.json");
const { createFactory } = require("ipfsd-ctl");
const df = createFactory({
  ipfsHttpModule: require("ipfs-http-client"),
});

const daemonsOptions = {
  args: ["--enable-namesys-pubsub"], // enable ipns over pubsub
};
const apiPort = "5001";

async function testUI(url, apiMultiAddr) {
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
        IPFS_API_MULTIADDR: apiMultiAddr,
      },
      all: true,
    }
  );
  proc.all.on("data", (data) => {
    process.stdout.write(data);
  });

  await proc;
}

/* 
This test needs:
✓ a server listening on an API port 5001
✓ listening on websocket port 4003

then

1. 
*/
async function runTest() {
  let nodes = [];
  nodes = await Promise.all([
    df.spawn({
      type: "go",
      test: true,
      ipfsOptions: {
        config: {
          Addresses: {
            Swarm: ["/ip4/127.0.0.1/tcp/4003/ws", "/ip4/0.0.0.0/tcp/4001"],
            API: `/ip4/127.0.0.1/tcp/${apiPort}`,
          },
        },
      },
      ...daemonsOptions,
    }),
    df.spawn({
      type: "js",
      test: true,
      ...daemonsOptions,
    }),
    // go-ipfs needs two nodes in the DHT to be able to publish a record
    // TODO: Remove this when js-ipfs has a DHT
    df.spawn({
      type: "go",
      test: true,
      ...daemonsOptions,
    }),
  ]);

  const server = await startServer(__dirname);

  try {

    // swarm the go node to the other 2 nodes
    await nodes[0].api.swarm.connect(nodes[1].api.peerId.addresses[0])
    // go-ipfs needs two nodes in the DHT to be able to publish a record
    // TODO: Remove this when js-ipfs has a DHT
    await nodes[0].api.swarm.connect(nodes[2].api.peerId.addresses[0])

    console.log('wait for republish as we can receive the republish message first') // eslint-disable-line no-console
    await delay(60000);

    const goPeer = await nodes[0].api.id();

    const address = goPeer.addresses
      .map((ma) => ma.toString())
      .find((addr) => addr.includes("/ws/p2p/Qm"));

    if (!address) {
      throw new Error(
        `Could not find web socket address in ${goPeer.addresses}`
      );
    }

    let apiMultiAddr = `/ip4/${server.url}/tcp/${apiPort}`;

    await testUI(server.url, apiMultiAddr);

  } finally {
    await nodes[0].stop();
    await nodes[1].stop();
    await nodes[2].stop();
    await server.stop();
  }
}

module.exports = runTest;

/* 
This test needs:

1. put the server API port in the text input, click connect
assert connected

2. put the websocket multiaddr int he input, click connect
assert connected

3. put the content to publish in the input, click publish
assert published

4. listen for resolve

*/
module.exports[pkg.name] = function (browser) {
  let local = null;
  let remote = null;

  browser
    .url(process.env.IPFS_EXAMPLE_TEST_URL)
    .waitForElementVisible("#api-url")
    .clearValue("#api-url")
    .setValue("#api-url", process.env.IPFS_API_MULTIADDR)
    .pause(1000)
    .click("#node-connect");

  /*
  browser.expect
    .element("#peers-addrs")
    .text.to.contain(process.env.IPFS_RELAY_ID);
  browser.expect.element("#peer-id").text.to.not.equal("");

  // exchange peer info
  browser
    .getText("#addrs", (result) => {
      local = {
        addr: result.value.trim(),
      };
      console.info(`got local circuit relay address ${local.addr}`); // eslint-disable-line no-console
    })
    .getText("#peer-id", (result) => {
      local.id = result.value.trim();
      console.info(`got local peer id ${local.id}`); // eslint-disable-line no-console
    })
    .perform(async (browser, done) => {
      console.info(`writing local data ${local.addr}`); // eslint-disable-line no-console
      await fs.writeJson(process.env.IPFS_LOCAL_PEER_ID_FILE, local);

      console.info("reading remote circuit relay address"); // eslint-disable-line no-console
      for (let i = 0; i < 100; i++) {
        try {
          remote = await fs.readJson(process.env.IPFS_REMOTE_PEER_ID_FILE, {
            encoding: "utf8",
          });

          if (!remote || !remote.addr || !remote.id) {
            throw new Error("Remote circuit relay address was empty");
          }

          console.info(`got remote circuit relay address ${remote.addr}`); // eslint-disable-line no-console
          done();

          break;
        } catch (err) {
          // ignore
        }

        await delay(1000);
      }

      console.info(`connecting to remote peer ${remote.addr}`); // eslint-disable-line no-console

      browser
        .clearValue("#peer")
        .setValue("#peer", remote.addr)
        .pause(1000)
        .click("#connect");

      browser.expect.element("#peers-addrs").text.to.contain(remote.id);

      browser
        .clearValue("#message")
        .setValue("#message", "hello")
        .pause(1000)
        .click("#send");

      browser.expect
        .element("#msgs")
        .text.to.contain(`${remote.id.substr(-4)}: hello`);
      browser.expect
        .element("#msgs")
        .text.to.contain(`${local.id.substr(-4)}: hello`);
    });
    */

  browser.end();
};
