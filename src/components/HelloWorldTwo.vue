<template>
  <div class="container">
    <div class="action">
      <button @click="preview">预览</button>
      <button @click="krpanoControl(false)">隐藏control</button>
      <button @click="krpanoControl(true)">显示control</button>
      <button @click="getCurrentView">获取当前视图</button>
      <button @click="getMouseLocation">获取点击位置</button>
      <button @click="transmitXML('来至vue的点击传参')">传递xml</button>
    </div>
    <div class="scene-select-box">
      <ul>
        <li
          v-for="scene in sceneList"
          :key="scene.thumburl"
          :class="{
            'hotspot-detail-scene-selected': currentSceneId === scene.id,
          }"
        >
          <img :src="scene.thumburl" @click="clickToggleScene(scene)" />
          <div>
            <span>{{ scene.name.split(/_/)[1] }}</span>
          </div>
        </li>
      </ul>
    </div>
    <div id="pano"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 定义类型接口
interface KrpanoInterface {
  get: (param: string) => any;
  set: (param: string, value: any) => void;
  call: (command: string) => void;
  screentosphere: (x: number, y: number) => { x: number; y: number };
  // 其他必要的方法接口
}

interface Scene {
  id: number;
  name: string;
  thumburl: string;
  // 其他场景属性
}

interface HotspotInfo {
  // 原生属性
  name: string;
  style: string;
  ath: string | number;
  atv: string | number;
  scale: number;
  edge: string;
  oy: string | number;
  ox?: string | number;
  url: string;
  distorted?: boolean;
  // 自定义属性
  id: string;
  peak_type: '2' | '3';
  peak_sceneId: string;
  peak_to_scene?: string;
  peak_to_sceneId?: string;
  peak_tooltip: string;
  peak_head?: string;
  linkedscene?: string;
}

// 状态定义
const krpano = ref<KrpanoInterface | null>(null);
const sceneList = ref<Scene[]>([]);
const currentSceneId = ref<number>(1);
const trackMouseId = ref<number | null>(null);
const trackMouseValue = ref<string | null>(null);

// 跳转热点数据
const goToHotspotList: HotspotInfo[] = [
  {
    name: "peak_hotspot_1",
    style: "peak_hotspotstyle_animation_tooltip",
    ath: "-122",
    atv: "-0.21",
    scale: 0.5,
    edge: "center",
    oy: "-20",
    distorted: false,
    url: "static/skin/hotspot/portal.png",
    id: "1",
    peak_type: "3",
    peak_sceneId: "1",
    peak_to_scene: "scene_2",
    peak_to_sceneId: "2",
    peak_tooltip: "前往神秘大楼",
  },
  {
    id: "2",
    name: "peak_hotspot_2",
    style: "peak_hotspotstyle_animation_tooltip",
    ath: "-155",
    atv: "2",
    scale: 0.5,
    edge: "center",
    oy: "-20",
    distorted: false,
    url: "static/skin/hotspot/portal.png",
    peak_type: "3",
    peak_sceneId: "2",
    peak_to_scene: "scene_1",
    peak_to_sceneId: "1",
    peak_tooltip: "前往篮球场",
  },
];

// 标记热点数据
const markHotspotList: HotspotInfo[] = [
  {
    name: "peak_hotspot_6",
    style: "peak_hotspotstyle_tooltip_head",
    ath: "-136.81297139120792",
    atv: "-16.590751927541321",
    scale: 0.5,
    edge: "center",
    oy: "-20",
    ox: "5",
    url: "static/skin/hotspot/line.png",
    id: "6",
    peak_type: "2",
    peak_sceneId: "1",
    peak_head: "https://resource.v123.cn/v/Data/upload/live/auth/656/image/5c38805344125.jpg",
    peak_tooltip: "我曾经在这里扣篮",
  },
  {
    id: "7",
    name: "peak_hotspot_7",
    style: "peak_hotspotstyle_tooltip_head",
    ath: "-54",
    atv: "19",
    scale: 0.5,
    edge: "center",
    oy: "-20",
    url: "static/skin/hotspot/line.png",
    peak_type: "2",
    peak_sceneId: "1",
    peak_head: "https://resource.v123.cn/v/Data/upload/live/auth/656/image/5c38805344125.jpg",
    peak_tooltip: "挥洒汗水的地方",
  },
  {
    id: "8",
    name: "peak_hotspot_8",
    style: "peak_hotspotstyle_tooltip_head",
    ath: "-73",
    atv: "-11",
    scale: 0.5,
    edge: "center",
    oy: "-20",
    url: "static/skin/hotspot/line.png",
    peak_type: "2",
    peak_sceneId: "2",
    peak_head: "https://resource.v123.cn/v/Data/upload/live/auth/656/image/5c38805344125.jpg",
    peak_tooltip: "不知名的神秘大楼",
  },
];

// 方法实现
function transmitXML(name: string) {
  console.log(name);
}

function init() {
  if (!krpano.value) return;

  sceneList.value = krpano.value.get("scene").getArray();

  setTimeout(() => {
    const currentSceneName = krpano.value?.get("xml.scene");
    if (currentSceneName && krpano.value) {
      currentSceneId.value = krpano.value.get("scene").getItem(currentSceneName).id;
      getSceneHotspot();
    }
  }, 500);
}

function preview() {
  window.open("static/tour.html");
}

function krpanoControl(is: boolean) {
  if (!krpano.value) return;

  krpano.value.set("layer[skin_control_bar].visible", is);
  krpano.value.set("layer[skin_splitter_bottom].visible", is);
  krpano.value.set("layer[skin_scroll_window].visible", is);
}

function clickToggleScene(scene: Scene) {
  if (currentSceneId.value === scene.id || !krpano.value) return;

  goToScene({
    peak_to_scene: scene.name,
    peak_to_sceneId: scene.id,
  });
}

function clickHotspot(hotspotInfo: HotspotInfo) {
  if (hotspotInfo.peak_type === '2') {
    alert("我是普通的热点");
  } else if (hotspotInfo.peak_type === '3') {
    goToScene({
      hotspotName: hotspotInfo.name,
      peak_to_scene: hotspotInfo.peak_to_scene,
      peak_to_sceneId: hotspotInfo.peak_to_sceneId,
    });
  }
}

function getToggleSceneAnimation(type = 1): string | undefined {
  let blend: string | undefined;
  switch (type) {
    case 1:
      blend = "BLEND(1.0, easeInCubic)";
      break;
    case 2:
      blend = "ZOOMBLEND(2.0, 2.0, easeInOutSine)";
      break;
    case 3:
      blend = "COLORBLEND(2.0, 0x000000, easeOutSine)";
      break;
    case 4:
      blend = "LIGHTBLEND(1.0, 0xFFFFFF, 2.0, linear)";
      break;
    case 5:
      blend = "SLIDEBLEND(1.0, 0.0, 0.2, linear)";
      break;
    case 6:
      blend = "SLIDEBLEND(1.0, 90.0, 0.01, linear)";
      break;
    case 7:
      blend = "SLIDEBLEND(1.0, 135.0, 0.4, linear)";
      break;
    case 8:
      blend = "OPENBLEND(1.0, 0.0, 0.2, 0.0, linear)";
      break;
    case 9:
      blend = "OPENBLEND(0.7, 1.0, 0.1, 0.0, linear)";
      break;
    case 10:
      blend = "OPENBLEND(1.0, -1.0, 0.3, 0.0, linear)";
      break;
    case 11:
      blend = "OPENBLEND(1.0, -0.5, 0.3, 0.8, linear)";
      break;
    default:
      break;
  }
  return blend;
}

interface GoToSceneOptions {
  hotspotName?: string;
  peak_to_scene?: string;
  peak_to_sceneId?: number | string;
}

function goToScene(obj: GoToSceneOptions, animationType = 1) {
  if (!krpano.value || !obj.peak_to_scene || !obj.peak_to_sceneId) return;

  const blend = getToggleSceneAnimation(animationType);

  krpano.value.call(
    `peak_click_to_scene(${obj.peak_to_scene},${blend || ''},${obj.hotspotName || ''});`
  );

  currentSceneId.value = Number(obj.peak_to_sceneId);

  setTimeout(() => {
    getSceneHotspot();
  }, 1000);
}

function getSceneHotspot() {
  if (!krpano.value) return;

  const hotspots = [
    ...goToHotspotList.filter(
      (item) => item.peak_sceneId === currentSceneId.value.toString()
    ),
    ...markHotspotList.filter(
      (item) => item.peak_sceneId === currentSceneId.value.toString()
    ),
  ];

  hotspots.forEach((item) => {
    addHotspot(item);
  });
}

function addHotspot(hotspotInfo: HotspotInfo) {
  if (!krpano.value) return;

  krpano.value.call(`addhotspot(${hotspotInfo.name})`);

  // 设置热点公共属性
  krpano.value.set(`hotspot[${hotspotInfo.name}].ath`, hotspotInfo.ath);
  krpano.value.set(`hotspot[${hotspotInfo.name}].atv`, hotspotInfo.atv);
  krpano.value.set(`hotspot[${hotspotInfo.name}].scale`, hotspotInfo.scale);
  krpano.value.set(`hotspot[${hotspotInfo.name}].edge`, hotspotInfo.edge);
  krpano.value.set(`hotspot[${hotspotInfo.name}].oy`, hotspotInfo.oy);
  if (hotspotInfo.ox !== undefined) {
    krpano.value.set(`hotspot[${hotspotInfo.name}].ox`, hotspotInfo.ox);
  }
  krpano.value.set(`hotspot[${hotspotInfo.name}].url`, hotspotInfo.url);
  krpano.value.set(`hotspot[${hotspotInfo.name}].peak_tooltip`, hotspotInfo.peak_tooltip);

  // 不同热点类型添加不同的属性
  switch (hotspotInfo.peak_type) {
    case '2':
      if (hotspotInfo.peak_head) {
        krpano.value.set(`hotspot[${hotspotInfo.name}].peak_head`, hotspotInfo.peak_head);
      }
      krpano.value.set(
        `hotspot[${hotspotInfo.name}].onloaded`,
        "add_hotspot_tooltip();add_hotspot_head();"
      );
      break;
    case '3':
      if (hotspotInfo.peak_to_scene) {
        krpano.value.set(
          `hotspot[${hotspotInfo.name}].linkedscene`,
          hotspotInfo.peak_to_scene
        );
      }
      krpano.value.set(
        `hotspot[${hotspotInfo.name}].onloaded`,
        "do_crop_animation(100,100,15);add_hotspot_tooltip();"
      );
      break;
    default:
      break;
  }

  // 处理点击事件
  if (krpano.value.get("device.html5")) {
    // HTML5环境
    krpano.value.set(
      `hotspot[${hotspotInfo.name}].onclick`,
      () => clickHotspot(hotspotInfo)
    );
  } else {
    // Flash环境
    krpano.value.set(
      `hotspot[${hotspotInfo.name}].onclick`,
      `js( alert(calc('hotspot \"${hotspotInfo.name}\" clicked')); )`
    );
  }
}

function getCurrentView() {
  if (!krpano.value) return;

  const hlookat = krpano.value.get("view.hlookat");
  const vlookat = krpano.value.get("view.vlookat");
  const fov = krpano.value.get("view.fov");
  const distortion = krpano.value.get("view.distortion");
  console.log({ hlookat, vlookat, fov, distortion });
}

function getMouseLocation() {
  if (!krpano.value) return;

  const mx = krpano.value.get("mouse.x");
  const my = krpano.value.get("mouse.y");
  const pnt = krpano.value.screentosphere(mx, my);
  const h = pnt.x;
  const v = pnt.y;

  console.log({
    ath: h,
    atv: v,
    x: mx,
    y: my,
  });

  return {
    ath: h,
    atv: v,
    x: mx,
    y: my,
  };
}

// 生命周期钩子
onMounted(() => {
  window.embedpano({
    swf: "static/tour.swf",
    xml: "static/tour.xml",
    target: "pano",
    html5: "auto",
    mobilescale: 1.0,
    passQueryParameters: true,
    onready: (krpano_interface) => {
      krpano.value = krpano_interface;
      init();
    },
    onerror: (error) => {
      console.log(error);
    },
  });

  window.myGetXML = transmitXML;
});
</script>

<style scoped lang="scss">
.container {
  width: 100%;
}
#pano {
  height: 600px;
}
.scene-select-box {
  ul {
    display: flex;
    li {
      img {
        width: 100px;
        height: 100px;
      }
    }
  }
  .hotspot-detail-scene-selected {
    border: solid #409eff 2px;
  }
}
</style>
