<template>
  <div id="canvas-container">
    <snackbar ref="snackbar" :string="snackbar.string" :timeout="snackbar.timeout" :type="snackbar.type"/>

    <login-dialog ref="loginDialog" :show-signup="showSignup"/>
    <signup-dialog ref="signupDialog" :show-login="showLogin"/>
    <v-dialog
        :value="!connected"
        persistent
        width="300"
    >
      <v-card
          color="primary"
          dark
      >
        <v-card-text>
          Pixnano server is not responding..
          <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>

    <div id="optionsMenu" class="pa-5 rounded-lg light--text backdrop" :class="this.nightMode ? 'grey darken-4' : 'dark'">
      <div class="logo">
        <img :src="require('@/assets/logo.png')" height="auto" width="auto">
      </div>

      <v-chip
          v-if="account.username"
          class="rounded-xl font-weight-bold backdrop"
          style="width: 100%;cursor: pointer"
          color="primary"
          label
          @click="accountMenu = !accountMenu"
      >
        <v-icon left>
          mdi-account
        </v-icon>
        <div
            class="px-2 ml-auto rounded-lg primary darken-1"
        >
          {{ account.username }}
        </div>
        <v-card
            v-if="accountMenu"
            id="account-menu"
            class="ml-2 rounded-lg backdrop-primary"
            color="dark"
            tile
        >
          <v-list dark flat dense color="red">
            <v-list-item-group>
              <v-list-item
                  @click="logout"
              >
                <v-list-item-icon>
                  <v-icon>mdi-power</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Sign Out</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-chip>

      <v-chip
          v-if="account.username"
          class="mt-2 font-weight-bold backdrop"
          style="width: 100%;cursor: pointer"
          color="primary"
          text-color="white"
      >
        <v-icon left large class="d-inline-flex justify-start">$nanoIcon</v-icon>
        <div
            class="px-2 ml-auto rounded-lg primary darken-1"
        >
          {{ account._funds ? account._funds.toLocaleString() : 0 }}
        </div>
      </v-chip>

      <v-btn v-if="!this.account.username" id="signIn" class=" rounded-lg primary backdrop" width="100%" @click="showLogin">Sign In</v-btn>

      <div class="mt-2">
        <div class="pa-4 rounded-lg float-right" :style="{ backgroundColor: color, border: '2px solid ' +  this.$vuetify.theme.themes.light.secondary}" style="width: 100%;cursor: pointer" @click="$refs.colorPicker.click()">
          <input hidden ref="colorPicker" type="color" @change="changeColor">
        </div>
      </div>

      <v-btn id="toggleMode" class="mt-2 rounded-lg primary backdrop" width="100%" @click="editMode = !editMode">{{ editMode ? 'Edit Mode' : 'Viewing Mode' }}</v-btn>
      <v-btn id="toggleGrid" class="mt-2 rounded-lg primary backdrop" width="100%" @click="showGrid = !showGrid">{{ showGrid ? 'Grid: ON' : 'Grid: Off' }}</v-btn>
      <v-btn id="centerCanvas" class="mt-2 rounded-lg primary backdrop" width="100%" @click="resetCanvases">Center Canvas</v-btn>
      <v-btn id="toggleNightMode" class="mt-2 rounded-lg light backdrop" width="100%" @click="$emit('update:nightMode', !nightMode);">{{ nightMode ? 'Dark Theme' : 'Light Theme' }}</v-btn>
    </div>

    <div v-if="canvas.data.length > 0" id="detailsMenu" class="pa-5 rounded-lg light--text backdrop" :class="this.nightMode ? 'grey darken-4' : 'dark'">
      <v-chip
          class="rounded-xl font-weight-bold backdrop"
          style="width: 50%;cursor: pointer"
          color="primary"
          label
      >
        <div
            class="px-2 mx-auto rounded-lg primary darken-1"
        >
          {{ `X: ${selectedPixel.x}` }}
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
          {{ `Y: ${selectedPixel.y}` }}
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
            :style="{ color: (canvas.data[selectedPixel.x][selectedPixel.y].owner === this.account.username) ? '#1aff00' : 'white' }"
        >
          {{ canvas.data[selectedPixel.x][selectedPixel.y].owner ? canvas.data[selectedPixel.x][selectedPixel.y].owner : '' }}
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
          {{ canvas.data[selectedPixel.x][selectedPixel.y].price ? canvas.data[selectedPixel.x][selectedPixel.y].price : 0 }}
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
          {{ canvas.data[selectedPixel.x][selectedPixel.y].updated ? new Date(canvas.data[selectedPixel.x][selectedPixel.y].updated).toLocaleDateString() : 0 }}
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
          {{ canvas.data[selectedPixel.x][selectedPixel.y].updated ? new Date(canvas.data[selectedPixel.x][selectedPixel.y].updated).toLocaleTimeString() : 0 }}
        </div>
      </v-chip>
      <v-chip
          class="mt-2 rounded-xl font-weight-bold backdrop"
          style="width: 100%;cursor: pointer"
          :color="canvas.data[selectedPixel.x][selectedPixel.y].color ? canvas.data[selectedPixel.x][selectedPixel.y].color : '#FFF'"
          label
      >
        <div
            class="px-2 mx-auto rounded-lg"
            style="background-color: rgba(0, 0, 0, 0.5);color: white"
        >
          {{ canvas.data[selectedPixel.x][selectedPixel.y].color ? canvas.data[selectedPixel.x][selectedPixel.y].color : '#FFF' }}
        </div>
      </v-chip>
    </div>


    <div
        id="canvas-controller"
        :style="{ transform: `scale(${zoom.zoomIntensity})`, left: movement.dragging ? movement.offsetX + movement.deltaX + 'px' : movement.offsetX + 'px', top: movement.dragging ? movement.offsetY + movement.deltaY + 'px' : movement.offsetY + 'px', cursor: editMode ? (movement.dragging ? 'move' : 'default') : 'move' }"
        @contextmenu.prevent
        @mousedown.left="handleLeftClick"
        @mousedown.right="startDragging"
        @mouseup.left="endDragging"
        @mouseup.right="endDragging"
        @mouseleave="endDragging"
        @mousemove="updateMousePosition"
        @wheel.prevent="zoomCanvasContainer"
    >
      <div id="canvas-wrapper" :style="{width: (canvas.dimensions.x || defaultCanvasDimension) + 'px', height: (canvas.dimensions.y || defaultCanvasDimension) + 'px'}">
        <canvas id="canvas"/>
        <canvas id="grid" :style="{ visibility: showGrid ? 'visible' : 'hidden' }"/>
      </div>
    </div>
  </div>
</template>

<script>
  import Snackbar from "@/components/Snackbar";
  import SignupDialog from "@/components/SignupDialog";
  import LoginDialog from "@/components/LoginDialog";

  export default {
    name: 'MainView',
    components: {
      LoginDialog,
      SignupDialog,
      Snackbar,
    },
    props: ['nightMode'],
    data: () => ({
      LOCALSTORAGE_COLLECTION: 'Pixnano',
      connected: false,
      accountMenu: false,
      account: {
        username: '',
        funds: 0,
      },
      jwtToken: '',
      authentication: {
        username: '',
        email: '',
        password: '',
      },
      defaultCanvasDimension: 64,
      canvas: {
        name: '',
        dimensions: {
          x: 0,
          y: 0,
        },
        data: [],
        created: 0,
        updated: 0
      },
      color: '#000000',
      scale: 1,
      editMode: false,
      showGrid: true,
      zoom: {
        zoomIntensity: 2,
        maxZoom: 32,
        minZoom: 1,
      },
      movement: {
        dragging: false,
        originX: 0,
        originY: 0,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
        deltaX: 0,
        deltaY: 0,
      },
      snackbar: {
        enabled: '',
        string: '',
        timeout: 4000,
        type: ''
      },
      selectedPixel: {
        x: 0,
        y: 0
      }
    }),
    sockets: {
      connect() {},
      disconnect() {
        this.connected = false;
      },
      account(account) {
        this.account = account;
      },
      authenticated({account, token}) {
        this.account = account;
        this.setToken(token);
        this.alert('Authenticated successfully!', 'success');
        this.hideLogin();
        this.hideSignup();
      },
      logout() {
        this.logout();
        this.getToken();
      },
      alert(string) {
        this.alert(string, 'error');
      },
      canvas(canvas) {
        this.connected = true;
        this.canvas = canvas;
        this.resetCanvases();
      },
      canvasUpdate(canvas) {
        this.connected = true;
        this.canvas = canvas;
        this.renderCanvas();
      },
      pixel(pixel) {
        this.canvas.data[pixel.x][pixel.y] = pixel;
        this.drawPixel(pixel.x, pixel.y, pixel.color);
      }
    },
    methods: {
      getCanvas() {
        this.$socket.emit('canvas');
      },
      resetCanvases() {
        const CANVAS_CONTAINER = document.getElementById("canvas-container");
        const CANVAS_CONTAINER_BOUNDS = CANVAS_CONTAINER.getBoundingClientRect();
        const CANVAS = document.getElementById("canvas");
        const GRID = document.getElementById("grid");

        this.movement.offsetX = (CANVAS_CONTAINER_BOUNDS.width - this.canvas.dimensions.x) / 2;
        this.movement.offsetY = (CANVAS_CONTAINER_BOUNDS.height - this.canvas.dimensions.x) / 2;

        CANVAS.width = this.canvas.dimensions.x;
        GRID.width = this.canvas.dimensions.x;
        CANVAS.height = this.canvas.dimensions.y;
        GRID.height = this.canvas.dimensions.y;

        this.renderCanvas();
        this.renderGrid();
      },
      alert(string, type = '', timeout = 4000) {
        this.snackbar = {
          string,
          type,
          timeout
        };
        this.$refs.snackbar.enable();
      },
      showLogin() {
        this.$refs.loginDialog.enable();
      },
      hideLogin() {
        this.$refs.loginDialog.disable();
      },
      showSignup() {
        this.$refs.signupDialog.enable();
      },
      hideSignup() {
        this.$refs.signupDialog.disable();
      },
      setToken(token) {
        this.jwtToken = token;
        localStorage.setItem(this.LOCALSTORAGE_COLLECTION, this.jwtToken);
      },
      getToken() {
        this.jwtToken = localStorage.getItem(this.LOCALSTORAGE_COLLECTION);
        if (this.jwtToken) {
          this.authenticateJwt(this.jwtToken);
        } else {
          this.showSignup();
        }
      },
      deleteToken() {
        this.jwtToken = '';
        localStorage.removeItem(this.LOCALSTORAGE_COLLECTION);
      },
      logout() {
        this.deleteToken();
        this.account = {};
      },
      authenticateJwt(jwtToken) {
        this.$socket.emit('authenticate-jwt', jwtToken);
      },
      handleLeftClick(e) {
        if (this.editMode) { this.buyPixel(e) } else { this.startDragging(e) }
      },
      drawPixel(x, y, color) {
        const CANVAS = document.getElementById("canvas");
        const CANVAS_CTX = CANVAS.getContext("2d");

        CANVAS_CTX.fillStyle = color
        CANVAS_CTX.fillRect(x * this.scale, y * this.scale, this.scale, this.scale)
      },
      buyPixel() {
        if (this.account._funds >= this.getPixelPrice(this.selectedPixel.x, this.selectedPixel.y)) {
          this.drawPixel(this.selectedPixel.x, this.selectedPixel.y, this.color);
          this.$socket.emit('pixel', { x: this.selectedPixel.x, y: this.selectedPixel.y, color: this.color });
        } else {
          this.alert('Insufficient funds!', 'error');
        }
        //console.log("Clicked!", this.selectedPixel.x, this.selectedPixel.y, this.zoom.zoomIntensity)
      },
      getPixelPrice(x, y) {
        let price = 1;

        if (this.canvas.data[x] && this.canvas.data[x][y]) {
          const pixel = this.canvas.data[x][y];
          price = (pixel.purchases * 2) || 1;
        }

        return price;
      },
      changeColor(e) {
        this.color = e.target.value;
      },
      startDragging(e) {
        this.movement.dragging = true;
        this.movement.startX = e.x;
        this.movement.startY = e.y;
      },
      endDragging() {
        this.movement.dragging = false;
        this.movement.offsetX += this.movement.deltaX;
        this.movement.offsetY += this.movement.deltaY;
        this.movement.deltaX = 0;
        this.movement.deltaY = 0;
        //this.movement.originX = (this.this.canvas.dimensions.x - this.movement.offsetX) / 5;
        //this.movement.originY = (this.this.canvas.dimensions.y - this.movement.offsetY) / 5;
      },
      moveCanvasContainer(e) {
        this.movement.deltaX = e.x - this.movement.startX;
        this.movement.deltaY = e.y - this.movement.startY;
      },
      updateMousePosition(e) {
        const CANVAS = document.getElementById("canvas");
        const CANVAS_BOUNDS = CANVAS.getBoundingClientRect();
        let x = Math.floor(((e.clientX - CANVAS_BOUNDS.left) / this.zoom.zoomIntensity) / this.scale);
        let y = Math.floor(((e.clientY - CANVAS_BOUNDS.top) / this.zoom.zoomIntensity) / this.scale) - 1;

        if (x < 0 || x > this.canvas.dimensions.x) {
          x = 0;
        }

        if (y < 0 || y > this.canvas.dimensions.y) {
          y = 0;
        }

        this.selectedPixel.x = x;
        this.selectedPixel.y = y;

        if (this.movement.dragging) this.moveCanvasContainer(e);
      },
      zoomCanvasContainer(e) {
        let scrollDirection;
        const minZoom = this.zoom.minZoom;
        const maxZoom = this.zoom.maxZoom;

        scrollDirection = (e.deltaY > 0) ? -0.1 : 0.1;
        scrollDirection *= (Math.sqrt(this.zoom.zoomIntensity)*1.6);

        if(scrollDirection > 0 && this.zoom.zoomIntensity <= maxZoom || scrollDirection < 0 && this.zoom.zoomIntensity > minZoom) {
          this.zoom.zoomIntensity += scrollDirection;
          if(this.zoom.zoomIntensity > maxZoom) this.zoom.zoomIntensity = maxZoom;
          if(this.zoom.zoomIntensity < minZoom) this.zoom.zoomIntensity = minZoom;
        }
      },
      renderCanvas() {
        const CANVAS = document.getElementById("canvas");
        const CANVAS_CTX = CANVAS.getContext("2d");

        for (let x = 0; x < this.canvas.data.length; x++) {
          this.canvas.data[x].forEach((pixel, y) => {
            CANVAS_CTX.fillStyle = pixel.color;
            CANVAS_CTX.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);
          })
        }
      },
      renderGrid() {
        const GRID = document.getElementById("grid");
        const GRID_CTX = GRID.getContext("2d");
        const GRID_COLOR_EVEN = '#D3D3D3';
        const GRID_COLOR_UNEVEN = '#FFFFFF';

        for(let row = 0;row<this.canvas.dimensions.y;row++){
          for(let i = 0;i<this.canvas.dimensions.x;i++) {
            if(i%2===0) {
              if(row%2===0) {
                GRID_CTX.fillStyle = GRID_COLOR_EVEN
              } else {
                GRID_CTX.fillStyle = GRID_COLOR_UNEVEN
              }
            } else {
              if(row%2===1) {
                GRID_CTX.fillStyle = GRID_COLOR_EVEN
              } else {
                GRID_CTX.fillStyle = GRID_COLOR_UNEVEN
              }
            }
            GRID_CTX.fillRect(i,row,1,1);
          }
        }
      }
    },
    mounted() {
      this.getToken();
      this.getCanvas();
    }
  }
</script>

<style lang="scss">
img {
  max-width: 100%;
  max-height: 100%;
}

.v-chip {
  overflow: visible!important;
}

.v-chip__content {
  width: 100%;
}

#optionsMenu {
  z-index: 5;
  width: 196px;
  position: absolute;
  left: 1rem;
  top: 1rem;
}

#account-menu {
  position: absolute;
  left: 100%;
  z-index: 20;
}

#detailsMenu {
  z-index: 5;
  width: 196px;
  position: absolute;
  right: 1rem;
  top: 1rem;
}

.logo {
  z-index: 5;
  width: auto;
  height: auto;
  position: relative;
  display: inline-block;
}

canvas {
  display: block!important;
  image-rendering: -moz-crisp-edges;
  image-rendering: pixelated;
  position: absolute;
}

#canvas-controller {
  position: absolute;
  transform-origin: center;
  z-index: 1;
}

#canvas-wrapper {
  position: relative;
}

#grid {
  opacity: 0.25;
  pointer-events: none;
}

#canvas-container {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
</style>
