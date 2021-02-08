<template>
  <v-app>
    <v-main :class="nightMode ? 'black' : 'primary'">
      <HelloWorld :nightMode.sync="nightMode"/>
    </v-main>
  </v-app>
</template>

<script>
import HelloWorld from './components/MainView';

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
html, body {
  width: 100%;
  height: 100%;
  margin: 0px;
  border: 0;
  overflow: hidden; /*  Disable scrollbars */
  display: block;  /* No floating content on sides */
}

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
