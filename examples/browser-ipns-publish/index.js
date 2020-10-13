"use strict";

const IpfsHttpClient = require("ipfs-http-client");
const ipns = require("ipns");
const IPFS = require("ipfs");
const pRetry = require("p-retry");
const last = require("it-last");
const cryptoKeys = require("human-crypto-keys"); // { getKeyPairFromSeed }
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayFromString = require('uint8arrays/from-string')

const { sleep, Logger, onEnterPress, catchAndLog } = require("./util");

async function main() {
  const apiUrlInput = document.getElementById("api-url");
  const nodeConnectBtn = document.getElementById("node-connect");

  const peerAddrInput = document.getElementById("peer-addr");
  const wsConnectBtn = document.getElementById("peer-connect");

  const ipnsInput = document.getElementById("topic");
  const publishBtn = document.getElementById("publish");

  const namespace = "/record/";
  const retryOptions = {
    retries: 5,
  };

  let log = Logger(document.getElementById("console"));
  let sLog = Logger(document.getElementById("server-console"));
  let keyName = "self";

  let ipfsAPI; // remote server IPFS node
  let ipfsBrowser; // local browser IPFS node
  let peerId;

  // init local browser node right away
  log(`Browser IPFS getting ready...`);
  ipfsBrowser = await IPFS.create({
    pass: "01234567890123456789",
    EXPERIMENTAL: { ipnsPubsub: true },
  });
  const { id } = await ipfsBrowser.id();
  log(`Browser IPFS ready! Node id: ${id}`);
  document.getElementById("api-url").disabled = false;
  document.getElementById("node-connect").disabled = false;

  async function nodeConnect(url) {
    log(`Connecting to ${url}`);
    ipfsAPI = IpfsHttpClient(url);
    const { id, agentVersion } = await ipfsAPI.id();
    peerId = id;
    log(`<span class="green">Success!</span>`);
    log(`Version ${agentVersion}`);
    log(`Peer ID ${id}`);
    document.getElementById("peer-addr").disabled = false;
    document.getElementById("peer-connect").disabled = false;
  }

  async function wsConnect(addr) {
    if (!addr) throw new Error("Missing peer multiaddr");
    if (!ipfsBrowser)
      throw new Error("Wait for the local IPFS node to start first");
    log(`Connecting to peer ${addr}`);
    await ipfsBrowser.swarm.connect(addr);
    log(`<span class="green">Success!</span>`);
    log("Listing swarm peers...");
    await sleep();
    const peers = await ipfsBrowser.swarm.peers();
    peers.forEach((peer) => {
      //console.log(`peer: ${JSON.stringify(peer, null, 2)}`);
      const fullAddr = `${peer.addr}/ipfs/${peer.peer}`;
      log(
        `<span class="${
          addr.endsWith(peer.peer) ? "teal" : ""
        }">${fullAddr}</span>`
      );
    });
    log(`(${peers.length} peers total)`);
    document.getElementById("topic").disabled = false;
    document.getElementById("publish").disabled = false;
  }

  // Wait until a peer subscribes a topic
  const waitForPeerToSubscribe = async (daemon, topic) => {
    await pRetry(async () => {
      const res = await daemon.pubsub.ls();

      if (!res || !res.length || !res.includes(topic)) {
        throw new Error("Could not find subscription");
      }

      return res[0];
    }, retryOptions);
  };

  // wait until a peer know about other peer to subscribe a topic
  const waitForNotificationOfSubscription = (daemon, topic, peerId) =>
    pRetry(async () => {
      const res = await daemon.pubsub.peers(topic);

      if (!res || !res.length || !res.includes(peerId)) {
        throw new Error("Could not find peer subscribing");
      }
    }, retryOptions);

  async function subs(node, topic, tLog) {
    tLog(`Subscribing to ${topic}`);
    await node.pubsub.subscribe(
      topic,
      (msg) => {
        const from = msg.from;
        const seqno = msg.seqno.toString("hex");

        tLog(
          `${new Date(
            Date.now()
          ).toLocaleTimeString()}\n Message ${seqno} from ${from}`
        );

        let regex = "/record/";
        if (topic.match(regex) ? topic.match(regex).length > 0 : false) {
          tLog(
            "\n#" +
              ipns.unmarshal(msg.data).sequence.toString() +
              ") Topic: " +
              msg.topicIDs[0].toString()
          );
          tLog("Value:\n" + ipns.unmarshal(msg.data).value.toString());
        } else {
          try {
            tLog(JSON.stringify(msg.data.toString(), null, 2));
          } catch (_) {
            tLog(msg.data.toString("hex"));
          }
        }
      }
    );
  }

  async function createKey(keyName) {
    return new Promise(async (resolve, reject) => {
      try {
        // quick and dirty key gen, don't do this in real life
        const key = await IPFS.multihashing.digest(
          uint8ArrayFromString(keyName + Math.random().toString(36).substring(2)),
          "sha2-256"
        );
        const keyPair = await cryptoKeys.getKeyPairFromSeed(key, "rsa");

        // put it on the browser IPNS keychain and name it
        await ipfsBrowser.key.import(keyName, keyPair.privateKey);
        // now this key can be used to publish to this ipns publicKey
        resolve(true);
      } catch (err) {
        console.log(`Error creating Key ${keyName}: \n ${err}`);
        reject(false);
      }
    });
  }

  async function publish(content) {
    if (!content) throw new Error("Missing ipns content to publish");
    if (!ipfsAPI) throw new Error("Connect to a go-server node first");
    if (!ipfsAPI.name.pubsub.state() || !ipfsBrowser.name.pubsub.state())
      throw new Error(
        "IPNS Pubsub must be enabled on bother peers, use --enable-namesys-pubsub"
      );

    log(`Publish to IPNS`); // subscribes the server to our IPNS topic

    let browserNode = await ipfsBrowser.id();
    let serverNode = await ipfsAPI.id();

    // get which key this will be publish under, self or an imported custom key
    keyName = document.querySelector('input[name="keyName"]:checked').value;
    let keys = { name: "self", id: browserNode.id }; // default init

    if (keyName != "self") {
      if (!(await ipfsBrowser.key.list()).find((k) => k.name == keyName))
        // skip if custom key exists already
        await createKey(keyName);
      let r = await ipfsBrowser.key.list();
      keys = r.find((k) => k.name == keyName);
      log(JSON.stringify(keys));
    }

    log(`Initial Resolve ${keys.id}`); // subscribes the server to our IPNS topic
    last(ipfsAPI.name.resolve(keys.id, { stream: false })); // save the pubsub topic to the server to make them listen

    // set up the topic from ipns key
    let b58 = await IPFS.multihash.fromB58String(keys.id);
    const ipnsKeys = ipns.getIdKeys(b58);
    const topic = `${namespace}${uint8ArrayToString(ipnsKeys.routingKey, 'base64url')}`;

    // subscribe and log on both nodes
    await subs(ipfsBrowser, topic, log); // browserLog
    await subs(ipfsAPI, topic, sLog); // serverLog

    // confirm they are subscribed
    await waitForPeerToSubscribe(ipfsAPI, topic); // confirm topic is on THEIR list  // API
    await waitForNotificationOfSubscription(ipfsBrowser, topic, serverNode.id); // confirm they are on OUR list

    let remList = await ipfsAPI.pubsub.ls(); // API
    if (!remList.includes(topic))
      sLog(`<span class="red">[Fail] !Pubsub.ls ${topic}</span>`);
    else sLog(`[Pass] Pubsub.ls`);

    let remListSubs = await ipfsAPI.name.pubsub.subs(); // API
    if (!remListSubs.includes(`/ipns/${keys.id}`))
      sLog(`<span class="red">[Fail] !Name.Pubsub.subs ${keys.id}</span>`);
    else sLog(`[Pass] Name.Pubsub.subs`);

    // publish will send a pubsub msg to the server to update their ipns record
    log(`Publishing ${content} to ${keys.name} /ipns/${keys.id}`);
    const results = await ipfsBrowser.name.publish(content, {
      resolve: false,
      key: keyName,
    });
    log(`Published ${results.name} to ${results.value}`); //

    log(`Try resolve ${keys.id} on server through API`);

    let name = await last(
      ipfsAPI.name.resolve(keys.id, {
        stream: false,
      })
    );
    log(`Resolved: ${name}`);
    if (name == content) {
      log(`<span class="green">IPNS Publish Success!</span>`);
      log(
        `<span class="green">Look at that! /ipns/${keys.id} resolves to ${content}</span>`
      );
    } else {
      log(
        `<span class="red">Error, resolve did not match ${name} !== ${content}</span>`
      );
    }
  }

  const onNodeConnectClick = catchAndLog(
    () => nodeConnect(apiUrlInput.value),
    log
  );

  apiUrlInput.addEventListener("keydown", onEnterPress(onNodeConnectClick));
  nodeConnectBtn.addEventListener("click", onNodeConnectClick);

  const onwsConnectClick = catchAndLog(
    () => wsConnect(peerAddrInput.value),
    log
  );
  peerAddrInput.addEventListener("keydown", onEnterPress(onwsConnectClick));
  wsConnectBtn.addEventListener("click", onwsConnectClick);

  const onPublishClick = catchAndLog(() => publish(ipnsInput.value), log);
  ipnsInput.addEventListener("keydown", onEnterPress(onPublishClick));
  publishBtn.addEventListener("click", onPublishClick);
}

main();
