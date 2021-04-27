import Vue from 'vue';
import App from './App.vue';
import IPFS from 'ipfs-core'

Vue.prototype.$ipfs = IPFS
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app');
