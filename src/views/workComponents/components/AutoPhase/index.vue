<template>
  <div class="phase-area">
    <div class="phase-bold-area">
      <img id="phase-bold-1" class="phase-img phase-img--bold" alt="相位1-粗" />
      <img id="phase-bold-2" class="phase-img phase-img--bold" alt="相位2-粗" />
      <img id="phase-bold-3" class="phase-img phase-img--bold" alt="相位3-粗" />
      <img id="phase-bold-4" class="phase-img phase-img--bold" alt="相位4-粗" />
    </div>
    <div class="phase-normal-area">
      <img id="phase-normal-1" class="phase-img phase-img--normal" alt="相位1-细" />
      <img id="phase-normal-2" class="phase-img phase-img--normal" alt="相位2-细" />
      <img id="phase-normal-3" class="phase-img phase-img--normal" alt="相位3-细" />
      <img id="phase-normal-4" class="phase-img phase-img--normal" alt="相位4-细" />
    </div>
  </div>

</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import AutoPhaseBold from './src/index-bold.js';
import AutoPhaseNormal from './src/index-normal.js';

const phaseList = [
  {
    "phaseCode": "1",
    "phaseRelFlowList": [
      {
        "direction": 2,
        "directionName": "东",
        "directionAngle": 90,
        "laneDirection": [
          3,
          1
        ],
        "laneDirectionName": [
          "右转",
          "直行"
        ],
        "pedestrianAngle": 0,
        "enterExitPedestrian": [
          0,
          1
        ],
        "enterExitPedestrianName": [
          "北入口行人",
          "北出口行人"
        ],
        "conflictLaneDirection": [
          2
        ],
        "conflictLaneDirectionName": [
          "左转"
        ]
      },
      {
        "direction": 6,
        "directionName": "西",
        "directionAngle": 270,
        "laneDirection": [
          3,
          1
        ],
        "laneDirectionName": [
          "右转",
          "直行"
        ],
        "pedestrianAngle": 180,
        "enterExitPedestrian": [
          0,
          1
        ],
        "enterExitPedestrianName": [
          "南入口行人",
          "南出口行人"
        ],
        "conflictLaneDirection": null,
        "conflictLaneDirectionName": null
      }
    ]
  },
  {
    "phaseCode": "2",
    "phaseRelFlowList": [
      {
        "direction": 4,
        "directionName": "南",
        "directionAngle": 180,
        "laneDirection": [
          4,
          // 1,
          // 2,
          3
        ],
        "laneDirectionName": [
          "右转",
          "直行"
        ],
        "pedestrianAngle": 90,
        "enterExitPedestrian": [
          0,
          1
        ],
        "enterExitPedestrianName": [
          "东入口行人",
          "东出口行人"
        ],
        "conflictLaneDirection": [
          2
        ],
        "conflictLaneDirectionName": null
      },
      {
        "direction": 0,
        "directionName": "北",
        "directionAngle": 0,
        "laneDirection": [
          3,
          1
        ],
        "laneDirectionName": [
          "右转",
          "直行"
        ],
        "pedestrianAngle": 270,
        "enterExitPedestrian": [
          0,
          1
        ],
        "enterExitPedestrianName": [
          "西入口行人",
          "西出口行人"
        ],
        "conflictLaneDirection": null,
        "conflictLaneDirectionName": null
      }
    ]
  },
  {
    "phaseCode": "3",
    "phaseRelFlowList": [
      {
        "direction": 2,
        "directionName": "东",
        "directionAngle": 90,
        "laneDirection": [
          2
        ],
        "laneDirectionName": [
          "左转"
        ],
        "pedestrianAngle": null,
        "enterExitPedestrian": null,
        "enterExitPedestrianName": null,
        "conflictLaneDirection": null,
        "conflictLaneDirectionName": null
      },
      {
        "direction": 6,
        "directionName": "西",
        "directionAngle": 270,
        "laneDirection": [
          2
        ],
        "laneDirectionName": [
          "左转"
        ],
        "pedestrianAngle": null,
        "enterExitPedestrian": null,
        "enterExitPedestrianName": null,
        "conflictLaneDirection": null,
        "conflictLaneDirectionName": null
      }
    ]
  },
  {
    "phaseCode": "4",
    "phaseRelFlowList": [
      {
        "direction": 4,
        "directionName": "南",
        "directionAngle": 180,
        "laneDirection": [
          2
        ],
        "laneDirectionName": [
          "左转"
        ],
        "pedestrianAngle": null,
        "enterExitPedestrian": null,
        "enterExitPedestrianName": null,
        "conflictLaneDirection": null,
        "conflictLaneDirectionName": null
      },
      {
        "direction": 0,
        "directionName": "北",
        "directionAngle": 0,
        "laneDirection": [
          2
        ],
        "laneDirectionName": [
          "左转"
        ],
        "pedestrianAngle": null,
        "enterExitPedestrian": null,
        "enterExitPedestrianName": null,
        "conflictLaneDirection": null,
        "conflictLaneDirectionName": null
      }
    ]
  }
]
onMounted(async () => {
  await nextTick()
  // for(const index in phaseList){
  //   const autoPhase = new AutoPhase(phaseList[index]?.phaseRelFlowList,'base64');
  //   // autoPhase.update(phaseList[index]?.phaseRelFlowList)
  // }
  const autoPhase = new AutoPhaseNormal(phaseList);
  const phaseImgList = await autoPhase.generatePhase()
  console.log('autoPhase', phaseImgList);
  for (let i of phaseImgList) {
    //设置phase1到phase4 的图片
    document.getElementById(`phase-normal-${i.phaseCode}`).src = i.iconBase64
  }
  const autoPhaseBold = new AutoPhaseBold(phaseList);
  const phaseBoldImgList = await autoPhaseBold.generatePhase()
  for (let i of phaseBoldImgList) {
    //设置phase1到phase4 的图片
    document.getElementById(`phase-bold-${i.phaseCode}`).src = i.iconBase64
  }
})
</script>
<style scoped lang="scss">
.phase-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.phase-bold-area,
.phase-normal-area {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 50%;
}

.phase-img {
  width: pxTvw(160);
  height: pxTvh(160);
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}
</style>