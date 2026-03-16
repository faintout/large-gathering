<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menus = computed(() =>
  router
    .getRoutes()
    .filter((r) => r.meta?.title && r.path !== '/' && !r.path.includes(':'))
    .map((r) => ({
      path: r.path,
      title: r.meta.title,
      name: r.name,
    })),
)

const activeMenu = computed(() => route.path)
</script>

<template>
  <el-config-provider>
    <el-container class="app-shell">
      <el-aside class="app-shell__sider" width="220px">
        <div class="app-shell__logo">
          <span class="app-shell__logo-main">Large Gathering</span>
          <span class="app-shell__logo-sub">前端示例平台</span>
        </div>
        <el-scrollbar class="app-shell__menu-scroll">
          <el-menu
            :default-active="activeMenu"
            class="app-shell__menu"
            router
            background-color="transparent"
            text-color="#cfd9ff"
            active-text-color="#ffffff"
          >
            <el-menu-item
              v-for="item in menus"
              :key="item.path"
              :index="item.path"
            >
              <span class="app-shell__menu-dot" />
              <span class="app-shell__menu-title">{{ item.title }}</span>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
      </el-aside>

      <el-container>
        <el-header class="app-shell__header" height="56px">
          <div class="app-shell__header-left">
            <div class="app-shell__breadcrumb">
              <span class="app-shell__breadcrumb-main">
                {{ route.meta.title || '欢迎使用 Large Gathering' }}
              </span>
              <span class="app-shell__breadcrumb-sub">
                {{ route.meta.description ? `- ${route.meta.description}` : '' }}
              </span>
            </div>
          </div>
          <div class="app-shell__header-right">
            <el-button type="primary" size="small" plain>
              组件示例库
            </el-button>
          </div>
        </el-header>

        <el-main class="app-shell__main">
          <el-scrollbar class="app-shell__content-scroll">
            <div class="app-shell__content-card">
              <router-view v-slot="{ Component }">
                <transition name="fade-slide" mode="out-in">
                  <component :is="Component" />
                </transition>
              </router-view>
            </div>
          </el-scrollbar>
        </el-main>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<style scoped>
.app-shell {
  height: 100vh;
  background: radial-gradient(circle at top left, #1d2b4a 0, #050814 50%, #050814 100%);
  color: #e6edf7;
}

.app-shell__sider {
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(18px);
  background: linear-gradient(180deg, rgba(20, 34, 68, 0.95), rgba(6, 9, 26, 0.95));
  border-right: 1px solid rgba(90, 114, 190, 0.4);
}

.app-shell__logo {
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(63, 87, 165, 0.6);
}

.app-shell__logo-main {
  display: block;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #ffffff;
}

.app-shell__logo-sub {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: rgba(188, 210, 255, 0.7);
}

.app-shell__menu-scroll {
  flex: 1;
  padding: 12px 8px 16px;
}

.app-shell__menu {
  border-right: none;
}

.app-shell__menu :deep(.el-menu-item) {
  height: 40px;
  line-height: 40px;
  margin-bottom: 4px;
  border-radius: 8px;
  padding-inline: 14px;
}

.app-shell__menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(53, 116, 255, 0.95), rgba(85, 141, 255, 0.8));
  box-shadow: 0 0 18px rgba(44, 101, 255, 0.6);
}

.app-shell__menu-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 10px;
  background: rgba(133, 168, 255, 0.6);
}

.app-shell__menu-title {
  font-size: 13px;
}

.app-shell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  backdrop-filter: blur(16px);
  background: linear-gradient(90deg, rgba(11, 19, 47, 0.96), rgba(12, 26, 71, 0.9));
  border-bottom: 1px solid rgba(60, 85, 160, 0.7);
}

.app-shell__breadcrumb-main {
  font-size: 16px;
  font-weight: 500;
}

.app-shell__main {
  padding: 16px 18px 18px;
}

.app-shell__content-scroll {
  height: 100%;
  overflow: hidden;
}

.app-shell__content-scroll :deep(.el-scrollbar__view) {
  height: 100%;
}

.app-shell__content-card {
  height: 100%;
  box-sizing: border-box;
  min-height: 0;
  border-radius: 14px;
  padding: 18px 18px 20px;
  background:
    radial-gradient(circle at 0 0, rgba(63, 103, 255, 0.3), transparent 60%),
    radial-gradient(circle at 100% 0, rgba(57, 180, 255, 0.2), transparent 55%),
    linear-gradient(135deg, rgba(16, 32, 80, 0.95), rgba(5, 10, 34, 0.98));
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.75),
    inset 0 0 0 1px rgba(107, 147, 255, 0.18);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
