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
      <v-btn id="centerCanvas" class="mt-2 rounded-lg primary backdrop" width="100%" @click="centerCanvas">Center Canvas</v-btn>
      <v-btn id="toggleNightMode" class="mt-2 rounded-lg light backdrop" width="100%" @click="$emit('update:nightMode', !nightMode);">{{ nightMode ? 'Dark Theme' : 'Light Theme' }}</v-btn>
    </div>

    // This fucker causes lag if I pass currentPixel
    <details-menu :account="account" :current-pixel="currentPixel" :night-mode="nightMode" />

    <div
        id="canvas-controller"
        :style="{ transform: `scale(${zoom.zoomIntensity})`,  cursor: editMode ? (movement.dragging ? 'move' : 'default') : 'move' }"
        @contextmenu.prevent
        @wheel.prevent="zoomCanvasContainer"
        @mousemove="handleMouseMovement"
        @mousedown="handleMouseDown"
        @mouseup="endDragging"
        @mouseleave="endDragging"
    >
      <canvas id="canvas"/>
      <canvas id="grid" :style="{ visibility: showGrid ? 'visible' : 'hidden' }"/>
    </div>
  </div>
</template>

<script>


  import Snackbar from "@/components/Snackbar";
  import LoginDialog from "@/components/LoginDialog";
  import SignupDialog from "@/components/SignupDialog";
  import DetailsMenu from "@/components/DetailsMenu";
  export default {
    name: 'MainView',
    components: {
      DetailsMenu,
      SignupDialog,
      LoginDialog,
      Snackbar
    },
    props: ['nightMode'],
    data: () => ({
      LOCALSTORAGE_COLLECTION: 'Pixnano',
      CANVAS_CONTAINER: '',
      CANVAS_CONTROLLER: '',
      CANVAS: '',
      GRID: '',
      CANVAS_CTX: '',
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
      defaultCanvasDimension: 256,
      canvasScaleModifier: 10,
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
      editMode: false,
      showGrid: false,
      zoom: {
        zoomIntensity: 0.3,
        maxZoom: 16,
        minZoom: 0.1,
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
      mouseCoords: {
        x: 0,
        y: 0
      }
    }),
    computed: {
      currentPixel() {
        return this.canvas.data.length > 0 ? this.canvas.data[this.mouseCoords.x][this.mouseCoords.y] : { x: 0, y: 0, color: undefined, owner: undefined, price: undefined, updated: 0 };
      }
    },
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
      init(canvas) {
        this.connected = true;
        this.canvas = canvas;
        this.resizeCanvas();
        this.centerCanvas();
        this.renderCanvas();
        this.renderGrid();
      },
      canvasUpdate(canvas) {
        if (canvas.data.length <= 0) return;
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
      resizeCanvas() {
        this.CANVAS_CONTROLLER.style.width = this.canvas.dimensions.x * this.canvasScaleModifier + 'px';
        this.CANVAS.width = this.canvas.dimensions.x * this.canvasScaleModifier;
        this.GRID.width = this.canvas.dimensions.x * this.canvasScaleModifier;

        this.CANVAS_CONTROLLER.style.height = this.canvas.dimensions.y * this.canvasScaleModifier + 'px';
        this.CANVAS.height = this.canvas.dimensions.y * this.canvasScaleModifier;
        this.GRID.height = this.canvas.dimensions.y * this.canvasScaleModifier;

        this.renderCanvas();
        this.renderGrid();
      },
      centerCanvas() {
        const CANVAS_CONTAINER_BOUNDS = this.CANVAS_CONTAINER.getBoundingClientRect();

        this.movement.offsetX = (CANVAS_CONTAINER_BOUNDS.width - this.canvas.dimensions.x * this.canvasScaleModifier) / 2;
        this.movement.offsetY = (CANVAS_CONTAINER_BOUNDS.height - this.canvas.dimensions.x * this.canvasScaleModifier) / 2;

        this.CANVAS_CONTROLLER.style.left = this.movement.offsetX + 'px';
        this.CANVAS_CONTROLLER.style.top = this.movement.offsetY + 'px';
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
        this.$socket.emit('logout');
      },
      authenticateJwt(jwtToken) {
        this.$socket.emit('authenticate-jwt', jwtToken);
      },
      handleLeftClick(e) {
        if (this.editMode) { this.buyPixel(e) } else { this.startDragging(e) }
      },
      drawPixel(x, y, color) {
        this.CANVAS_CTX.fillStyle = color
        this.CANVAS_CTX.fillRect(x * this.canvasScaleModifier, y * this.canvasScaleModifier, this.canvasScaleModifier, this.canvasScaleModifier)
      },
      buyPixel() {
        const x = this.mouseCoords.x;
        const y = this.mouseCoords.y;
        const color = this.color;

        if (this.account._funds >= this.getPixelPrice(x, y)) {
          this.drawPixel(x, y, color);
          this.$socket.emit('pixel', { x, y, color });
        } else {
          this.alert('Insufficient funds!', 'error');
        }
      },
      getPixelPrice(x, y) {
        return this.canvas.data[x][y]['price'];
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
        //this.movement.originX = (this.this.canvas.dimensions.x - this.movement.offsetX) / 5;
        //this.movement.originY = (this.this.canvas.dimensions.y - this.movement.offsetY) / 5;
      },
      handleMouseDown(e) {
        // Drag if in view mode or when right-click
        if (!this.editMode || e.button === 2) {
          this.startDragging(e);
        } else {
          this.buyPixel();
        }
      },
      handleMouseMovement(e) {
        this.updateMousePosition(e);
        this.updateMouseDeltaMovement(e);
        //window.requestAnimationFrame(this.handleMouseMovement);
      },
      updateMouseDeltaMovement(e) {
        this.movement.deltaX = this.movement.dragging ? e.clientX - this.movement.startX : 0;
        this.movement.deltaY = this.movement.dragging ? e.clientY - this.movement.startY : 0;
        this.CANVAS_CONTROLLER.style.left = this.movement.offsetX + this.movement.deltaX + 'px';
        this.CANVAS_CONTROLLER.style.top = this.movement.offsetY + this.movement.deltaY + 'px';
      },
      updateMousePosition(e) {
        if (!this.movement.dragging) {
          const CANVAS_BOUNDS = this.CANVAS.getBoundingClientRect();
          // Clamp between 0 and 255, we don't want pixels out of bounds
          let x = (e.clientX - CANVAS_BOUNDS.left) / this.zoom.zoomIntensity / this.canvasScaleModifier;
          let y = (e.clientY - CANVAS_BOUNDS.top) / this.zoom.zoomIntensity / this.canvasScaleModifier;

          this.mouseCoords.x = Math.min(Math.max(Math.floor(x), 0), this.canvas.dimensions.x - 1);
          this.mouseCoords.y = Math.min(Math.max(Math.floor(y), 0), this.canvas.dimensions.y - 1);
        }
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
        this.canvas.data.forEach((col, x) => {
          this.canvas.data[x].forEach((pixel, y) => {
            this.drawPixel(x, y, pixel.color);
          })
        })
      },
      // todo: Design new grid based on 10x10 tiles
      renderGrid() {
        const GRID_CTX = this.GRID.getContext("2d");
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
            GRID_CTX.fillRect(i * this.canvasScaleModifier, row * this.canvasScaleModifier,this.canvasScaleModifier,this.canvasScaleModifier);
          }
        }
      },
      linkElements() {
        this.CANVAS_CONTAINER = document.getElementById("canvas-container");
        this.CANVAS_CONTROLLER = document.getElementById("canvas-controller");
        this.CANVAS = document.getElementById("canvas");
        this.GRID = document.getElementById("grid");
        this.CANVAS_CTX = this.CANVAS.getContext('2d')
      },
    },
    mounted() {
      this.linkElements();
      this.getToken();
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
  display: block;
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
  image-rendering: -moz-crisp-edges;
  image-rendering: pixelated;
  position: absolute;
}

#canvas-controller {
  position: relative;
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
