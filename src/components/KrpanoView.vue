<template>
  <div class="container">
    <!-- 场景导航 -->
    <NavList
      :sceneList="sceneList"
      :currentSceneId="currentSceneId"
      @goToScene="goToScene"
    />

    <!-- 工具 -->
    <Tools :krpano="krpano" />
    <AddHotspot
      v-model="isAddHotspotShow"
      :krpano="krpano"
      :sceneList="sceneList"
      :currentSceneId="currentSceneId"
      :clickMouseLocation="clickMouseLocation"
      :is-add-hotspot-show="isAddHotspotShow"
      @addHotspot="addHotspot"
    />
    <!-- 场景视图 -->
    <div id="pano" @dblclick="dblclickScene"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits, reactive, computed } from 'vue';
import NavList from "./NavList.vue";
import Tools from "./Tools.vue";
import AddHotspot from "./AddHotspot.vue";

// 定义props
const props = defineProps<{
  // 这里可以定义组件接收的props
}>();

// 定义emits
const emit = defineEmits<{
  // 这里可以定义组件发送的事件
}>();

// 响应式数据
const krpano = ref<any>(null);
const currentSceneId = ref<number>(1);
const isAddHotspotShow = ref<boolean>(false);
const sceneList = ref<any[]>([]);
const trackMouseId = ref<any>(null);
const clickMouseLocation = reactive<{
  ath?: number;
  atv?: number;
  x?: number;
  y?: number;
}>({});

// 跳转热点数据
const goToHotspotList = ref([
  {
    scale: 0.5,
    edge: "center",
    oy: "-20",
    distorted: false,
    url: "static/skin/hotspot/portal.png",
    id: "1",
    name: "peak_hotspot_1",
    ath: "-122",
    atv: "-0.21",
    peak_type: "3",
    peak_sceneId: "1",
    peak_to_scene: "scene_2",
    peak_to_sceneId: "2",
    peak_tooltip: "前往神秘大楼",
  },
  {
    id: "2",
    name: "peak_hotspot_2",
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
]);

// 标记热点数据
const markHotspotList = ref([
  {
    name: "peak_hotspot_6",
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
    peak_head:
      "https://resource.v123.cn/v/Data/upload/live/auth/656/image/5c38805344125.jpg",
    peak_tooltip: "我曾经在这里扣篮",
  },
  {
    id: 7,
    name: "peak_hotspot_7",
    ath: -54,
    atv: 19,
    scale: 0.5,
    edge: "center",
    oy: "-20",
    url: "static/skin/hotspot/line.png",
    peak_type: "2",
    peak_sceneId: "1",
    peak_head:
      "https://resource.v123.cn/v/Data/upload/live/auth/656/image/5c38805344125.jpg",
    peak_tooltip: "挥洒汗水的地方",
  },
  {
    id: "8",
    name: "peak_hotspot_8",
    ath: "-73",
    atv: "-11",
    scale: 0.5,
    edge: "center",
    oy: "-20",
    url: "static/skin/hotspot/line.png",
    peak_type: "2",
    peak_sceneId: "2",
    peak_head:
      "https://resource.v123.cn/v/Data/upload/live/auth/656/image/5c38805344125.jpg",
    peak_tooltip: "不知名的神秘大楼",
  },
]);

// 动态加载 krpano 脚本
const loadKrpano = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!!window.embedpano) {
      console.log('window.embedpano:', window.embedpano);
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = '/myroom/static/tour.js';
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// 传递XML数据
const transmitXML = (name: string) => {
  console.log(name);
};

// 初始化数据
const init = () => {
  console.log('this.krpano:', krpano.value);
  sceneList.value = krpano.value.get("scene").getArray();
  console.log('this.sceneList', sceneList.value);
  const currentSceneName = krpano.value.get("xml.scene");
  console.log('currentSceneName', currentSceneName);
  currentSceneId.value = krpano.value
    .get("scene")
    .getItem(currentSceneName).id;
  console.log('this.currentSceneId', currentSceneId.value);
  getSceneHotspot();
};

// 预览
const preview = () => {
  window.open("static/tour.html");
};

// 隐藏或者显示下方自带控制面板 control
const krpanoControl = (is: boolean) => {
  console.log(krpano.value.get("hotspot[spot1546933175342]"));
  krpano.value.set("layer[skin_control_bar].visible", is);
  krpano.value.set("layer[skin_splitter_bottom].visible", is);
  krpano.value.set("layer[skin_scroll_window].visible", is);
};

// 点击热点
const clickHotspot = (hotspotInfo: any) => {
  console.log(hotspotInfo, 123);
  if (hotspotInfo.peak_type == 2) {
    alert("我是普通的热点");
  } else if (hotspotInfo.peak_type == 3) {
    goToScene({
      hotspotName: hotspotInfo.name,
      peak_to_scene: hotspotInfo.peak_to_scene,
      peak_to_sceneId: hotspotInfo.peak_to_sceneId,
    });
  }
};

// 获取切换场景的动画类型
const getToggleSceneAnimation = (type = 1) => {
  let blend: string;
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
      blend = "";
      break;
  }
  return blend;
};

// 场景结合动画跳转
const goToScene = (obj: any, animationType = 1) => {
  const blend = getToggleSceneAnimation(animationType);

  krpano.value.call(
    `peak_click_to_scene(${obj.peak_to_scene},${blend},${obj.hotspotName});`
  );
  currentSceneId.value = obj.peak_to_sceneId;

  setTimeout(() => {
    getSceneHotspot();
  }, 1000);
};

// 获取场景热点
const getSceneHotspot = () => {
  // 这里是获取场景热点的逻辑
};

// 添加热点 (私有方法)
const _addHotspot = (hotspotInfo: any) => {
  if (krpano.value) {
    krpano.value.call("addhotspot(" + hotspotInfo.name + ")");

    // 设置热点公共属性
    krpano.value.set(`hotspot[${hotspotInfo.name}].ath`, hotspotInfo["ath"]);
    krpano.value.set(`hotspot[${hotspotInfo.name}].atv`, hotspotInfo["atv"]);
    krpano.value.set(
      `hotspot[${hotspotInfo.name}].scale`,
      hotspotInfo["scale"]
    );
    krpano.value.set(
      `hotspot[${hotspotInfo.name}].edge`,
      hotspotInfo["edge"]
    );
    krpano.value.set(`hotspot[${hotspotInfo.name}].oy`, hotspotInfo["oy"]);
    krpano.value.set(`hotspot[${hotspotInfo.name}].ox`, hotspotInfo["ox"]);
    krpano.value.set(`hotspot[${hotspotInfo.name}].url`, hotspotInfo["url"]);
    krpano.value.set(
      `hotspot[${hotspotInfo.name}].peak_tooltip`,
      hotspotInfo["peak_tooltip"]
    );
    krpano.value.set(
      `hotspot[${hotspotInfo.name}].text`,
      hotspotInfo["peak_tooltip"]
    );
    krpano.value.set(`hotspot[${hotspotInfo.name}].visible`, true);

    // 不同热点类型添加不同的属性
    switch (hotspotInfo.peak_type) {
      case "2":
        krpano.value.set(
          `hotspot[${hotspotInfo.name}].peak_head`,
          hotspotInfo["peak_head"]
        );

        krpano.value.set(
          `hotspot[${hotspotInfo.name}].onloaded`,
          "add_hotspot_tooltip();add_hotspot_head();add_hotspot_tooltip_vr();"
        );
        break;

      case "3":
        krpano.value.set(
          `hotspot[${hotspotInfo.name}].linkedscene`,
          hotspotInfo.peak_to_scene
        );
        krpano.value.set(
          `hotspot[${hotspotInfo.name}].onloaded`,
          "do_crop_animation(100,100,15);add_hotspot_tooltip();add_hotspot_tooltip_vr()"
        );
        break;
      default:
        break;
    }

    // 设置点击事件
    if (krpano.value.get("device.html5")) {
      krpano.value.set(
        "hotspot[" + hotspotInfo.name + "].onclick",
        () => clickHotspot(hotspotInfo)
      );
    } else {
      krpano.value.set(
        "hotspot[" + hotspotInfo.name + "].onclick",
        "js( alert(calc('hotspot \"' + name + '\" clicked')) )"
      );
    }
  }
};

// 添加热点 (公共方法)
const addHotspot = (hotspotInfo: any) => {
  if (krpano.value) {
    krpano.value.call("addhotspot(" + hotspotInfo.name + ")");

    // 设置热点公共属性
    krpano.value.set(`hotspot[${hotspotInfo.name}].ath`, hotspotInfo["ath"]);
    krpano.value.set(`hotspot[${hotspotInfo.name}].atv`, hotspotInfo["atv"]);
    krpano.value.set(
      `hotspot[${hotspotInfo.name}].scale`,
      hotspotInfo["scale"]
    );
    krpano.value.set(
      `hotspot[${hotspotInfo.name}].edge`,
      hotspotInfo["edge"]
    );
    krpano.value.set(`hotspot[${hotspotInfo.name}].oy`, hotspotInfo["oy"]);
    krpano.value.set(`hotspot[${hotspotInfo.name}].ox`, hotspotInfo["ox"]);
    krpano.value.set(`hotspot[${hotspotInfo.name}].url`, hotspotInfo["url"]);
    krpano.value.set(
      `hotspot[${hotspotInfo.name}].peak_tooltip`,
      hotspotInfo["peak_tooltip"]
    );
    krpano.value.set(
      `hotspot[${hotspotInfo.name}].peak_type`,
      hotspotInfo["peak_type"]
    );
    krpano.value.set(`hotspot[${hotspotInfo.name}].normal`, false);
    krpano.value.set(`hotspot[${hotspotInfo.name}].visible`, true);

    // 不同热点类型添加不同的属性
    switch (hotspotInfo.peak_type) {
      case "2":
        krpano.value.set(
          `hotspot[${hotspotInfo.name}].peak_head`,
          hotspotInfo["peak_head"]
        );

        krpano.value.set(
          `hotspot[${hotspotInfo.name}].onloaded`,
          "add_hotspot_tooltip();add_hotspot_head();"
        );
        break;

      case "3":
        const blend = getToggleSceneAnimation(1);
        krpano.value.set(
          `hotspot[${hotspotInfo.name}].peak_to_scene`,
          hotspotInfo.peak_to_scene
        );
        krpano.value.set(`hotspot[${hotspotInfo.name}].blend`, blend);
        krpano.value.set(
          `hotspot[${hotspotInfo.name}].peak_to_sceneId`,
          hotspotInfo.peak_to_sceneId
        );
        console.log(hotspotInfo);
        krpano.value.set(
          `hotspot[${hotspotInfo.name}].onloaded`,
          `do_crop_animation(100,100,15);add_hotspot_tooltip_vr(${blend});`
        );
        break;
      default:
        break;
    }

    // 设置点击事件
    if (krpano.value.get("device.html5")) {
      krpano.value.set(
        "hotspot[" + hotspotInfo.name + "].onclick",
        () => clickHotspot(hotspotInfo)
      );
    } else {
      krpano.value.set(
        "hotspot[" + hotspotInfo.name + "].onclick",
        "js( alert(calc('hotspot \"' + name + '\" clicked')) )"
      );
    }
  }
};

// 获取当前视角
const getCurrentView = () => {
  if (krpano.value) {
    const hlookat = krpano.value.get("view.hlookat");
    const vlookat = krpano.value.get("view.vlookat");
    const fov = krpano.value.get("view.fov");
    const distortion = krpano.value.get("view.distortion");
    console.log({ hlookat, vlookat, fov, distortion });
  }
};

// 双击视图
const dblclickScene = () => {
  clickMouseLocation.value = getMouseLocation();
  isAddHotspotShow.value = true;
};

// 获取点击的坐标
const getMouseLocation = () => {
  if (!krpano.value) return {};

  const mx = krpano.value.get("mouse.x");
  const my = krpano.value.get("mouse.y");
  const pnt = krpano.value.screentosphere(mx, my);
  const h = pnt.x;
  const v = pnt.y;

  return {
    ath: h,
    atv: v,
    x: mx,
    y: my,
  };
};

// 生命周期钩子 - 挂载完成
onMounted(async () => {
  await loadKrpano();

  const swf = '/myroom/static/tour.swf';
  const xml = '/myroom/static/tour.xml';
  window.embedpano({
    swf,
    xml,
    target: "pano",
    html5: "auto",
    mobilescale: 1.0,
    passQueryParameters: true,
    onready: (krpano_interface: any) => {
      krpano.value = krpano_interface;
    },
    onerror: (error: any) => {
      console.log(error);
    },
  });

  // 全局函数挂载
  window.myGetXML = transmitXML;
  window.init = init;
  window.clickHotspot_xml = (hotspotName: string) => {
    const hotspotInfo = goToHotspotList.value.find((item) => item.name == hotspotName);
    if (hotspotInfo) clickHotspot(hotspotInfo);
  };
});
</script>

<style scoped lang="scss">
.container {
  width: 100vw;
  height: 100vh;
}
#pano {
  width: 100%;
  height: 100%;
}
</style>
