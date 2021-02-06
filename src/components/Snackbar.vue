<template>
  <v-snackbar
      v-model="enabled"
      :timeout="timeout"
      :color="backgroundColor"
  >
    {{ string }}

    <template v-slot:action="{ attrs }">
      <v-btn
          color="blue"
          text
          v-bind="attrs"
          @click="snackbar = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  name: "Snackbar",
  props: ['string', 'timeout', 'type'],
  data: () => ({
    enabled: false,
  }),
  computed: {
    backgroundColor() {
      let color;
      switch (this.type) {
        case 'error':
          color = 'red';
          break;
        case 'success':
          color = 'green';
          break;
        default:
          color = 'grey';
      }
      return color;
    }
  },
  methods: {
    enable() {
      this.enabled = true;
    }
  },
}
</script>

<style scoped>

</style>
