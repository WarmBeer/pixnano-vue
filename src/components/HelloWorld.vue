<template>
  <v-container>
    <div id="optionsMenu" class="pa-5 rounded-lg dark light--text backdrop">
      <div class="logo">
        <img :src="require('@/assets/logo.png')" height="auto" width="auto">
      </div>
      <v-chip
          style="width: 100%"
          color="primary"
          text-color="white"
      >
        <v-avatar
            left
            class="primary darken-1"
        >
          10
        </v-avatar>
        <div class="font-weight-bold">
          Pixels Left
        </div>
        <img class="ml-2" height="12px" :src="require('@/assets/nano.svg')"/>
      </v-chip>
      <v-btn id="toggleMode" class="mt-4 rounded-lg primary backdrop" width="100%" @click="editMode = !editMode">{{ editMode ? 'Viewing Mode' : 'Edit Mode' }}</v-btn>
      <v-btn id="toggleGrid" class="mt-4 rounded-lg primary backdrop" width="100%" @click="showGrid = !showGrid">{{ showGrid ? 'Hide Grid' : 'Show Grid' }}</v-btn>
    </div>

    <div id="canvas-container" class="backdrop">
      <div
          id="zoom-controller"
          :style="{ transform: `scale(${zooming.zoom})`, left: movement.dragging ? movement.offsetX + movement.deltaX + 'px' : movement.offsetX + 'px', top: movement.dragging ? movement.offsetY + movement.deltaY + 'px' : movement.offsetY + 'px' }"
          @mousedown="startDragging"
          @mouseup="endDragging"
          @mouseleave="endDragging"
          @mousemove="moveCanvasContainer"
          @wheel.prevent="zoomCanvasContainer"
      >
        <div id="camera-controller" :style="{height: canvasSize + 'px', width: canvasSize + 'px'}">
          <canvas id="canvas" :height="canvasSize" :width="canvasSize"></canvas>
          <canvas id="grid" :style="{ visibility: showGrid ? 'visible' : 'hidden' }" :height="canvasSize" :width="canvasSize"></canvas>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script>
  export default {
    name: 'HelloWorld',

    data: () => ({
      canvasSize: 256,
      scale: 1,
      editMode: false,
      showGrid: true,
      zooming: {
        zoom: 2,
        maxZoom: 32,
        minZoom: 1,
      },
      movement: {
        dragging: false,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
        deltaX: 0,
        deltaY: 0,
      },
    }),
    methods: {
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
      },
      moveCanvasContainer(e) {
        if (this.movement.dragging) {
          this.movement.deltaX = e.x - this.movement.startX;
          this.movement.deltaY = e.y - this.movement.startY;
        }
      },
      zoomCanvasContainer(e) {
        let scrollDirection;
        const minZoom = this.zooming.minZoom;
        const maxZoom = this.zooming.maxZoom;

        scrollDirection = (e.deltaY > 0) ? -0.1 : 0.1;
        scrollDirection *= (Math.sqrt(this.zooming.zoom)*1.6);

        if(scrollDirection > 0 && this.zooming.zoom <= maxZoom || scrollDirection < 0 && this.zooming.zoom > minZoom) {
          this.zooming.zoom += scrollDirection;
          if(this.zooming.zoom > maxZoom) this.zooming.zoom = maxZoom;
          if(this.zooming.zoom < minZoom) this.zooming.zoom = minZoom;
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

<style scoped>
img {
  max-width: 100%;
  max-height: 100%;
}

#optionsMenu {
  z-index: 5;
  width: 200px;
  position: absolute;
  left: 1rem;
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
}

#zoom-controller {
  position: relative;
  transform-origin: center;
  z-index: 1;
  cursor: move;
}

#camera-controller {
  position: relative;
}

#canvas {
  position: absolute;
  transform-origin: 0 0;
}

#grid {
  position: absolute;
  display: block;
  z-index: 4;
  opacity: 0.25;
  pointer-events: none;
  transform-origin: 0 0;
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
