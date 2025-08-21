<template>
  <div class="scene-select-box">
    <ul v-if="sceneList.length" class="scene-select-box-ul">
      <div class="scene-select-box-ul-container">
        <li
            v-for="scene in sceneList"
            :key="scene.thumburl"
            class="scene-select-box-li"
            :class="{
          'hotspot-detail-scene-selected': currentSceneId === scene.id,
        }"
        >
          <img :src="scene.thumburl" @click="clickToggleScene(scene)" />
          <div>
            <span>{{ scene.title }}</span>
          </div>
        </li>
      </div>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

// 定义场景类型接口
interface Scene {
  id: number | string;
  name: string;
  thumburl: string;
  title: string;
}

// 定义props
const props = defineProps<{
  krpano?: any; // 这里的any可以根据实际类型替换为更具体的类型
  sceneList: Scene[];
  currentSceneId: number | string;
}>();

// 定义emits
const emit = defineEmits<{
  (e: 'goToScene', sceneData: { peak_to_scene: string; peak_to_sceneId: number | string }, num: number): void;
}>();

/**
 * 点击切换场景
 */
const clickToggleScene = (scene: Scene) => {
  // 点击的还是当前场景拦截
  if (props.currentSceneId === scene.id) return;
  emit(
    'goToScene',
    {
      peak_to_scene: scene.name,
      peak_to_sceneId: scene.id,
    },
    1
  );
};
</script>

<style lang="scss" scoped>
/* 定义滚动条的宽度和背景颜色 */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
  background-color: #F5F5F5;
}

/* 定义滚动条轨道的样式，包括内阴影和圆角 */
::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
  border-radius: 10px;
  background-color: #F5F5F5;
}

/* 定义滑块的样式，包括圆角和内阴影 */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
  background-color: #555;
}
.scene-select-box {
  position: absolute;
  bottom: 10px;
  left: 50%;
  z-index: 100;
  transform: translateX(-50%);
  width: 80%;
  display: flex;
  justify-content: center;
  opacity: 0.5;
  ul {
    display: flex;
    background-color: #fff;
    padding: 10px 10px 0 10px;
    border-radius: 10px;
    width: 100%;
    overflow: hidden;
    .scene-select-box-ul-container {
      display: flex;
      overflow-x: auto;
      padding-bottom: 5px;
    }
    li {
      border-radius: 5px;
      border: solid #ffffff 2px;
      box-sizing: border-box;
      margin: 0px 8px;
      list-style: none;
      img {
        width: 40px;
        height: 40px;
        border-radius: 5px;
        cursor: pointer;
      }
      div {
        text-align: center;
        span {
          font-size: 10px;
        }
      }
      &.hotspot-detail-scene-selected {
        border: solid #409eff 2px;
      }
    }
  }
}
/* 小屏幕平板及以上 */
@media screen and (min-width: 568px) {
  .scene-select-box {
    .scene-select-box-ul {
      li {
        img {
          width: 60px;
          height: 60px;
        }
        div {
          span {
            font-size: 12px;
          }
        }
      }
    }
  }
}

/* 中等屏幕桌面及以上 */
@media screen and  (min-width: 892px) {
  .scene-select-box {
    .scene-select-box-ul {
      li {
        img {
          width: 80px;
          height: 80px;
        }
        div {
          span {
            font-size: 14px;
          }
        }
      }
    }
  }
}

/* 大屏幕桌面 */
@media screen and  (min-width: 1200px) {
  .scene-select-box {
    .scene-select-box-ul {
      li {
        img {
          width: 100px;
          height: 100px;
        }
        div {
          span {
            font-size: 16px;
          }
        }
      }
    }
  }
}

/* 大屏幕桌面 */
@media screen and  (min-width: 1400px) {
  .scene-select-box {
    width: 1350px;
    .scene-select-box-ul {
      li {
        img {
          width: 100px;
          height: 100px;
        }
        div {
          span {
            font-size: 16px;
          }
        }
      }
    }
  }
}
</style>
