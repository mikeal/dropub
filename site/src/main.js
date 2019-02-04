import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import Files from './components/Files.vue'
import Home from './components/Home.vue'
require('setimmediate')

Vue.use(VueRouter)
Vue.config.productionTip = false

const routes = [
  { path: '/', component: Home },
  { path: '/cid/:cid*', component: Files, props: true }
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({ routes })

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
