<template>
  <div>
    <snackbar ref="snackbar" :string="snackbar.string" :timeout="snackbar.timeout" :type="snackbar.type"/>
    <v-row justify="center">
      <v-dialog
          v-model="signupDialog"
          persistent
          max-width="600px"
          style="z-index: 10"
      >
        <v-card>
          <v-toolbar
              flat
              dark
              color="primary"
          >
            <v-toolbar-title>Create New Account</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
                icon
                dark
                @click="signupDialog = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text>
            <v-container>
              <v-row>
                <v-form
                    class="mt-4"
                    style="width: 100%"
                    ref="form"
                    v-model="signupValid"
                >
                  <v-col cols="12">
                    <v-text-field
                        solo
                        flat
                        dense
                        background-color="light"
                        v-model="authentication.username"
                        label="Username*"
                        :counter="20"
                        :rules="[v => !!v || 'Username is required.', v => (v && v.length <= 20 && v.length >= 8) || 'Username can be min 8 and max 20 characters.', v => /^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/.test(v) || 'Illegal characters or wrong format.']"
                        required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                        solo
                        flat
                        dense
                        background-color="light"
                        v-model="authentication.email"
                        label="Email*"
                        :counter="20"
                        :rules="[v => !!v || 'Email is required.', v => (v && v.length <= 64 && v.length >= 4) || 'Email can be min 4 and max 64 characters.', v => /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(v) || 'Illegal characters or wrong format.']"
                        required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                        solo
                        flat
                        dense
                        background-color="light"
                        v-model="authentication.password"
                        label="Password*"
                        type="password"
                        :counter="20"
                        :rules="[v => !!v || 'Password is required.', v => (v && v.length <= 20 && v.length >= 8) || 'Password can be min 8 and max 20 characters.']"
                        required
                    ></v-text-field>
                  </v-col>
                  <v-alert
                      v-if="signupSuccess"
                      dense
                      text
                      type="success"
                  >
                    Account created <strong>successfully.</strong> Please <strong>wait a moment.</strong>
                  </v-alert>
                  <v-alert
                      v-if="signupError"
                      dense
                      text
                      type="error"
                  >
                    <strong>Error.</strong> {{ signupError }}
                  </v-alert>
                </v-form>
              </v-row>
              <v-row class="mt-4">
                <small>*indicates required field</small>
              </v-row>
              <v-row>
                <v-btn
                    color="primary"
                    :disabled="!signupValid"
                    @click="createAccount"
                >
                  Create New Account
                </v-btn>
                <v-btn
                    class="ml-4"
                    color="primary"
                    text
                    @click="signupDialog = false; loginDialog = true"
                >
                  Sign In
                </v-btn>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-row>

    <div id="optionsMenu" class="pa-5 rounded-lg dark light--text backdrop">
      <div class="logo">
        <img :src="require('@/assets/logo.png')" height="auto" width="auto">
      </div>
      <v-chip
          class="backdrop"
          style="width: 100%;cursor: pointer"
          color="primary"
          text-color="white"
      >
        <div
            class="px-2 rounded-lg primary darken-1"
        >
          {{ funds.toLocaleString() }}
        </div>
        <v-icon large class="d-inline-flex justify-end" style="width: 100%">$nanoIcon</v-icon>
      </v-chip>
      <div class="mt-2">
        <div class="pa-4 rounded-lg float-right" :style="{ backgroundColor: color, border: '2px solid ' +  this.$vuetify.theme.themes.light.secondary}" style="width: 100%;cursor: pointer" @click="$refs.colorPicker.click()">
          <input hidden ref="colorPicker" type="color" @change="changeColor">
        </div>
      </div>
      <v-btn id="toggleMode" class="mt-2 rounded-lg primary backdrop" width="100%" @click="editMode = !editMode">{{ editMode ? 'Viewing Mode' : 'Edit Mode' }}</v-btn>
      <v-btn id="toggleGrid" class="mt-2 rounded-lg primary backdrop" width="100%" @click="showGrid = !showGrid">{{ showGrid ? 'Hide Grid' : 'Show Grid' }}</v-btn>
      <v-btn id="toggleNightMode" class="mt-2 rounded-lg light backdrop" width="100%" @click="$emit('update:nightMode', !nightMode);">{{ nightMode ? 'Dark Theme' : 'Light Theme' }}</v-btn>
    </div>

    <div id="canvas-container">
      <div
          id="zoom-controller"
          :style="{ transform: `scale(${zoom.zoomIntensity})`, left: movement.dragging ? movement.offsetX + movement.deltaX + 'px' : movement.offsetX + 'px', top: movement.dragging ? movement.offsetY + movement.deltaY + 'px' : movement.offsetY + 'px', cursor: editMode ? 'default' : 'move' }"
          @contextmenu.prevent
          @mousedown.left="handleLeftClick"
          @mousedown.right="startDragging"
          @mouseup.left="endDragging"
          @mouseup.right="endDragging"
          @mouseleave="endDragging"
          @mousemove="moveCanvasContainer"
          @wheel.prevent="zoomCanvasContainer"
      >
        <div id="camera-controller" :style="{height: canvasSize + 'px', width: canvasSize + 'px'}">
          <canvas id="canvas" :height="canvasSize" :width="canvasSize"/>
          <canvas id="grid" :style="{ visibility: showGrid ? 'visible' : 'hidden' }" :height="canvasSize" :width="canvasSize"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Snackbar from "@/components/Snackbar";
  import md5 from "md5";
  export default {
    name: 'HelloWorld',
    components: {
      Snackbar,
      md5
    },
    props: ['nightMode'],
    data: () => ({
      SALT: 'Here comes the sun',
      account: {},
      jwtToken: '',
      signupDialog: true,
      signupValid: false,
      signupSuccess: false,
      signupError: '',
      loginDialog: false,
      loginValid: true,
      authentication: {
        username: '',
        email: '',
        password: '',
      },
      funds: 7312,
      canvasSize: 256,
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
        timeout: 2000,
        type: ''
      },
    }),
    sockets: {
      connect() {
        console.log('socket connected')
      },
      authenticated({account, token}) {
        this.signupSuccess = true;
        this.account = account;
        this.jwtToken = token;
        setTimeout(() => {
          this.signupDialog = false;
          this.signupSuccess = false;
        }, 2000);
      },
      alert(string) {
        this.alert(string, 'error');
      }
    },
    methods: {
      alert(string, type = '', timeout = 2000) {
        this.snackbar = {
          string,
          type,
          timeout
        };
        this.$refs.snackbar.enable();
      },
      createAccount() {
        this.signupError = '';
        const hashedPassword = md5(this.authentication.password + this.SALT);
        this.authentication.password = hashedPassword;
        this.$socket.emit('signup', this.authentication );
      },
      handleLeftClick(e) {
        if (this.editMode) { this.paintPixel(e) } else { this.startDragging(e) }
      },
      paintPixel(e) {
        const CAMERA_CONTROLLER = document.getElementById("camera-controller");
        const CANVAS = document.getElementById("canvas");
        const CANVAS_CTX = CANVAS.getContext("2d");
        const OFFSET = CAMERA_CONTROLLER.getBoundingClientRect();
        const xPosition = Math.floor(((e.clientX - OFFSET.left) / this.zoom.zoomIntensity) / this.scale)
        const yPosition = Math.floor(((e.clientY - OFFSET.top) / this.zoom.zoomIntensity) / this.scale)

        CANVAS_CTX.fillStyle = this.color
        CANVAS_CTX.fillRect(xPosition * this.scale, yPosition * this.scale, this.scale, this.scale)

        console.log("Clicked!", xPosition, yPosition, this.zoom.zoomIntensity)
        console.log("e!", ((e.clientX - OFFSET.left) / this.zoom.zoomIntensity), ((e.clientY - OFFSET.top) / this.zoom.zoomIntensity), this.zoom.zoomIntensity)
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
        this.movement.originX = (this.canvasSize - this.movement.offsetX)/5;
        this.movement.originY = (this.canvasSize - this.movement.offsetY)/5;
      },
      moveCanvasContainer(e) {
        if (this.movement.dragging) {
          this.movement.deltaX = e.x - this.movement.startX;
          this.movement.deltaY = e.y - this.movement.startY;
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
      renderDataOnCanvas(canvasData) {
        const CANVAS = document.getElementById("canvas");
        const CANVAS_CTX = CANVAS.getContext("2d");

        canvasData.forEach((row, rowIndex) => {
          row.forEach((col, colIndex) => {
            CANVAS_CTX.fillStyle = col
            CANVAS_CTX.fillRect(colIndex * this.scale, rowIndex * this.scale, this.scale, this.scale)
          })
        })
      },
      renderGrid() {
        const GRID = document.getElementById("grid");
        const GRID_CTX = GRID.getContext("2d");
        const GRID_COLOR_EVEN = '#D3D3D3';
        const GRID_COLOR_UNEVEN = '#FFFFFF';

        for(let row = 0;row<500;row++){
          for(let i = 0;i<500;i++) {
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
      this.renderGrid();
    }
  }
</script>

<style lang="scss">
html, body {
  margin:0;
  padding:0;
}

img {
  max-width: 100%;
  max-height: 100%;
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
  /*
  backdrop-filter: blur(8px);
  background-color: rgba(0, 0, 52, .8)!important;
   */
}

.logo {
  z-index: 5;
  width: auto;
  height: auto;
  position: relative;
  display: inline-block;
}

canvas {
  margin:-1px!important;
  display: block!important;
  image-rendering: -moz-crisp-edges;
  image-rendering: pixelated;
  position: absolute;
}

#zoom-controller {
  position: relative;
  transform-origin: center;
  z-index: 1;
}

#camera-controller {
  position: relative;
}

#grid {
  z-index: 4;
  opacity: 0.25;
  pointer-events: none;
}

#canvas-container {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  align-items: center;
  display: flex;
  justify-content: center;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

#camera-controller {
  position: relative;
}
</style>
