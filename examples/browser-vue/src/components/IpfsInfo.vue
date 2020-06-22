<template>
  <div class="ipfs-info">
    <img class="ipfs-logo" alt="IPFS logo" src="../assets/logo.svg" />
    <h1>{{ status }}</h1>
    <h2>ID: {{ id }}</h2>
    <h2>Agent version: {{ agentVersion }}</h2>
  </div>
</template>

<script>
export default {
  name: "IpfsInfo",
  data: function() {
    return {
      status: "Connecting to IPFS...",
      id: "",
      agentVersion: ""
    };
  },
  mounted: function() {
    this.getIpfsNodeInfo();
  },
  methods: {
    async getIpfsNodeInfo() {
      try {
        // Await for ipfs node instance.
        const ipfs = await this.$ipfs;
        // Call ipfs `id` method.
        // Returns the identity of the Peer.
        const { agentVersion, id } = await ipfs.id();
        this.agentVersion = agentVersion;
        this.id = id;
        // Set successful status text.
        this.status = "Connected to IPFS =)";
      } catch (err) {
        // Set error status text.
        this.status = `Error: ${err}`;
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.ipfs-logo {
  height: 10rem;
}
</style>
