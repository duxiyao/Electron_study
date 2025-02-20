<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js App"/>
  <button @click="openPopup">Open Popup</button>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

console.log(process.env.NODE_ENV)
export default {
  name: 'App',
  components: {
    HelloWorld
  },
  methods: {
      openPopup() {
          window.electron.send('open-popup');
      }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
