<template>
  <div id="detailsMenu" class="pa-5 rounded-lg light--text backdrop" :class="this.nightMode ? 'grey darken-4' : 'dark'">
    <v-chip
        class="rounded-xl font-weight-bold backdrop"
        style="width: 50%;cursor: pointer"
        color="primary"
        label
    >
      <div
          class="px-2 mx-auto rounded-lg primary darken-1"
      >
        {{ `X: ${currentPixel.x}` }}
      </div>
    </v-chip>
    <v-chip
        class="rounded-xl font-weight-bold backdrop"
        style="width: 50%;cursor: pointer"
        color="primary"
        label
    >
      <div
          class="px-2 mx-auto rounded-lg primary darken-1"
      >
        {{ `Y: ${currentPixel.y}` }}
      </div>
    </v-chip>
    <v-chip
        class="mt-2 rounded-xl font-weight-bold backdrop"
        style="width: 100%;cursor: pointer"
        color="primary"
        label
    >
      <v-icon left>
        mdi-account
      </v-icon>
      <div
          class="px-2 ml-auto rounded-lg primary darken-1"
          :style="{ color: currentPixel.owner === account.username ? '#53ff4d' : '#FFF'}"
      >
        {{ currentPixel.owner }}
      </div>
    </v-chip>
    <v-chip
        class="mt-2 font-weight-bold backdrop"
        style="width: 100%;cursor: pointer"
        color="primary"
        text-color="white"
    >
      <v-icon left large class="d-inline-flex justify-start">$nanoIcon</v-icon>
      <div
          class="px-2 ml-auto rounded-lg primary darken-1"
      >
        {{ currentPixel.price }}
      </div>
    </v-chip>
    <v-chip
        class="mt-2 font-weight-bold backdrop"
        style="width: 100%;cursor: pointer"
        color="primary"
        text-color="white"
    >
      <v-icon left>
        mdi-calendar
      </v-icon>
      <div
          class="px-2 ml-auto rounded-lg primary darken-1"
      >
        {{ new Date(currentPixel.updated).toLocaleDateString() }}
      </div>
    </v-chip>
    <v-chip
        class="mt-2 font-weight-bold backdrop"
        style="width: 100%;cursor: pointer"
        color="primary"
        text-color="white"
    >
      <v-icon left>
        mdi-clock
      </v-icon>
      <div
          class="px-2 ml-auto rounded-lg primary darken-1"
      >
        {{ new Date(currentPixel.updated).toLocaleTimeString() }}
      </div>
    </v-chip>
    <v-chip
        class="mt-2 rounded-xl font-weight-bold backdrop"
        style="width: 100%;cursor: pointer"
        :color="currentPixel.color"
        label
    >
      <div
          class="px-2 mx-auto rounded-lg white--text"
          style="background-color: rgba(0, 0, 0, 0.5)"
      >
        {{ currentPixel.color }}
      </div>
    </v-chip>
  </div>
</template>

<script>
export default {
  name: "DetailsMenu",
  props: ['account', 'currentPixel', 'nightMode']
}
</script>

<style scoped>

</style>
