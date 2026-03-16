<template>
    <div>
        <div class="content">
            <!-- 标志 -->
            <div class="legend">
                <img src="./assets/compass.png" alt="">
            </div>
            <!-- 潮汐车道 -->
            <div class="road-area" id="tidalLane"></div>
        </div>
    </div>
</template>

<script setup>
    // import TidalLane from '@faintout/tidal-lane'
    import TidalLane from './tidalLane.js'
    import { nextTick } from 'vue'
    nextTick(() => {
        const roadList = [
            {
                type:"bottom",
                tidal:false,
            },
            {
                type:'top',
                tidal:true,
            },
            {
                type:'top',
                tidal:true,
            },
            {
                type:'bottom',
                tidal:true,
            },
        ]
        const tidalLane = new TidalLane('tidalLane', roadList)
        //此处为更新车道的数据，
        setTimeout(()=>{
            tidalLane.setRoadList([
            {
                type:"bottom",
                tidal:true,
            },
            {
                type:'top',
                tidal:false,
            },
            {
                type:'top',
                tidal:false,
            },
            {
                type:'bottom',
                tidal:false,
            },
        ])
        },3000)
    })
</script>
<style scoped lang="scss">
.content {
    height: 331px;
    width: 464px;
    // background: url('../../../assets/img/trafficOrganization/cd.png') no-repeat;

    background-size: 100% 100%;
    // height: 270px;
    background: #E9EFFA;
    border-radius: 4px 4px 4px 4px;
    opacity: 1;
    border: 1px solid #BEDAFF;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .legend {
        position: absolute;
        top: 12px;
        left: 0;
        display: flex;
        flex-direction: column;
        align-items: center;

        img {
            width: pxTvw(46);
            height: pxTvh(68);
        }

        span {
            font-size: 14px;
            font-family: Source Han Sans CN-Bold, Source Han Sans CN;
            font-weight: bold;
            color: #000000;
            line-height: 16px;
        }
    }

    .road-area {
        width: 70%;
        height: 100%;
        background: #555555;
    }
}</style>