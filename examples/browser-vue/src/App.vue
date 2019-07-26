<template>
  <div id="app">
    <ipfs-info />
  </div>
</template>

<script>
import IpfsInfo from "./components/IpfsInfo.vue";

export default {
  name: "app",
  components: {
    IpfsInfo
  }
};
</script>

<style>
body {
  margin: 0;
}
#app {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
