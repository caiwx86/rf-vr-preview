<template>
  <div class="add-hotspot-box">
    <div class="hotspot-inp-box">
      <div>
        热点类型:
        <select name="" id="" v-model="selectValue">
          <option value="2">普通标记</option>
          <option value="3">跳转热点</option>
        </select>
      </div>
      <div v-if="selectValue === '3'">
        要跳转的场景:<select name="" id="" v-model="selectSceneId">
          <option
            v-for="scene in sceneList"
            :key="scene.thumburl"
            :value="scene.id"
            :disabled="currentSceneId === scene.id"
          >
            {{ scene.title }}
          </option>
        </select>
      </div>
      <div>热点tooltip:<input type="tooltip" v-model="tooltip" /></div>
      <div>
        <button @click="clickCancel">取消</button>
        <button @click="clickConfirm">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

type Scene = {
  id: string;
  title: string;
  thumburl: string;
};

type MouseLocation = {
  ath: string;
  atv: string;
};

type Krpano = {
  get: (key: string) => any;
};

type HotspotTemplate = {
  scale: number;
  edge: string;
  oy: string;
  distorted?: boolean;
  url: string;
  ath: string;
  atv: string;
  id: string | number;
  name: string;
  peak_type: string;
  peak_sceneId: string;
  peak_tooltip: string;
  peak_to_sceneId?: string;
  peak_to_scene?: Scene;
  peak_head?: string;
};

const props = defineProps<{
  isAddHotspotShow: boolean;
  krpano: Krpano;
  sceneList: Scene[];
  currentSceneId: string;
  clickMouseLocation: MouseLocation;
}>();

const emit = defineEmits<{
  (e: 'update:isAddHotspotShow', value: boolean): void;
  (e: 'addHotspot', hotspot: HotspotTemplate): void;
}>();

const selectValue = ref('2');
const selectSceneId = ref('');
const tooltip = ref('');

// 跳转热点模板
const toGoTemplate: HotspotTemplate = {
  scale: 0.5,
  edge: 'center',
  oy: '-20',
  distorted: false,
  url: 'static/skin/hotspot/portal.png',
  ath: '-155',
  atv: '2',
  id: '2',
  name: 'peak_hotspot_',
  peak_type: '3',
  peak_sceneId: '2',
  peak_to_scene: 'scene_1',
  peak_to_sceneId: '1',
  peak_tooltip: '前往篮球场',
};

// 普通标记热点模板
const markerTemplate: HotspotTemplate = {
  scale: 0.5,
  edge: 'center',
  oy: '-20',
  url: 'static/skin/hotspot/line.png',
  ath: '-83',
  atv: '-11',
  id: '8',
  name: 'peak_hotspot_8',
  peak_type: '2',
  peak_sceneId: '2',
  peak_head: 'https://resource.v123.cn/v/Data/upload/live/auth/656/image/5c38805344125.jpg',
  peak_tooltip: '不知名的神秘大楼',
};

const clickCancel = () => {
  emit('update:isAddHotspotShow', false);
};

const clickConfirm = () => {
  const currentSceneName = props.krpano.get('xml.scene');
  const currentScene = props.krpano.get('scene').getItem(currentSceneName);
  const currentSceneId = currentScene.id;
  const { ath, atv } = props.clickMouseLocation;
  const id = Date.now();
  const name = `peak_hotspot_${id}`;

  let hotspotInfo: HotspotTemplate;

  if (selectValue.value === '2') {
    hotspotInfo = {
      ...markerTemplate,
      ath,
      atv,
      id,
      name,
      peak_type: selectValue.value,
      peak_sceneId: currentSceneId,
      peak_tooltip: tooltip.value,
    };
    console.log(hotspotInfo);
  } else if (selectValue.value === '3') {
    const targetScene = props.sceneList.find(item => item.id === selectSceneId.value);
    hotspotInfo = {
      ...toGoTemplate,
      ath,
      atv,
      id,
      name,
      peak_type: selectValue.value,
      peak_sceneId: currentSceneId,
      peak_tooltip: tooltip.value,
      peak_to_sceneId: selectSceneId.value,
      peak_to_scene: targetScene,
    };
    console.log(hotspotInfo);
  } else {
    // 默认使用普通标记
    hotspotInfo = {
      ...markerTemplate,
      ath,
      atv,
      id,
      name,
      peak_type: selectValue.value,
      peak_sceneId: currentSceneId,
      peak_tooltip: tooltip.value,
    };
  }

  emit('addHotspot', hotspotInfo);
  emit('update:isAddHotspotShow', false);
};
</script>

<style lang="scss" scoped>
.add-hotspot-box {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 1;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  .hotspot-inp-box {
    padding: 20px;
    border-radius: 10px;
    background: #fff;
  }
}
</style>
