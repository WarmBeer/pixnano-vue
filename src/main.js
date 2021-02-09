import Vue from 'vue'
import App from './App.vue'
import store from './store'
import vuetify from './plugins/vuetify';
import { io } from 'socket.io-client';
import VueSocketIO from 'vue-socket.io';

Vue.config.productionTip = false

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost';

export const SocketInstance = io(API_URL);

Vue.use(new VueSocketIO({
  debug: true,
  connection: SocketInstance
}));

new Vue({
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
