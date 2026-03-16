<template>
  <div class="intersection-turn-flow-area">
    <div id="line">
    </div>
    <div id="flow">
    </div>
  </div>

</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import IntersectionTurnFlow from './src/intersectionTurnFlow-flow.js';
import IntersectionTurnFlowLine from './src/intersectionTurnFlow-line.js';
const data = [
  {
    "crossId": "CROSS_001",
    "angle": 0,
    "trunkList": [
      { "dir": 1, "flow": 120 },
      { "dir": 2, "flow": 350 },
      { "dir": 3, "flow": 180 }
    ]
  },
  {
    "crossId": "CROSS_001",
    "angle": 90,
    "trunkList": [
      { "dir": 1, "flow": 150 },
      { "dir": 2, "flow": 280 },
      { "dir": 3, "flow": 130 }
    ]
  },
  {
    "crossId": "CROSS_001",
    "angle": 180,
    "trunkList": [
      { "dir": 1, "flow": 90 },
      { "dir": 2, "flow": 320 },
      { "dir": 3, "flow": 160 }
    ]
  },
  {
    "crossId": "CROSS_001",
    "angle": 270,
    "trunkList": [
      { "dir": 1, "flow": 110 },
      { "dir": 2, "flow": 400 },
      { "dir": 3, "flow": 140 }
    ]
  }
]
onMounted(async () => {
  await nextTick()
  const instance = new IntersectionTurnFlow('#flow', data);
  const instanceLine = new IntersectionTurnFlowLine('#line', data);
})
</script>
<style scoped lang="scss">
.intersection-turn-flow-area {
  display: flex;
  // flex-direction: column;
  // align-items: center;
  justify-content: space-evenly;
  width: 100%;
  height: 100%;
}

.line {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40%;
  height: 40%;
}

.flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40%;
  height: 40%;
}
</style>