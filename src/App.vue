<template>
  <v-app>
    <v-main :class="nightMode ? 'black' : 'primary'">
      <HelloWorld :nightMode.sync="nightMode"/>
    </v-main>
  </v-app>
</template>

<script>
import HelloWorld from './components/HelloWorld';

export default {
  name: 'App',

  components: {
    HelloWorld,
  },

  data: () => ({
    nightMode: false,
  }),
};
</script>

<style>
html, body { padding: 0; margin: 0; width: 100%; height: 100%; }
body {overflow: hidden}

::-webkit-scrollbar {
  width: 0px;  /* remove scrollbar space */
  background: transparent;  /* optional: just make scrollbar invisible */
}
/* optional: show position indicator in red */
::-webkit-scrollbar-thumb {
  background: #FF0000;
}

.backdrop {
  box-shadow: 0 5px 15px rgb(0 0 0 / 10%);
}

.backdrop-primary {
  box-shadow: 0 10px 20px 0 rgb(74 144 226 / 25%);
}
</style>
