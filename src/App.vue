<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="less">
.size{
  width: 100%;
  height: 100%;
}
html,body{
  .size;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
#app {
  .size;
}
:-webkit-full-screen {
  background-color: rgb(255,255,255) !important;
}
:-moz-full-screen {
  background-color: rgb(255,255,255) !important;
}
:-ms-fullscreen {
  background-color: rgb(255,255,255) !important;
}  
:fullscreen {
  background-color: rgb(255,255,255) !important;
}
</style>
