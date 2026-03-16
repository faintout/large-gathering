import { createRouter, createWebHistory } from 'vue-router'

// 自动扫描 src/views 下的所有 index.vue 作为页面
// 约定：
// - 路由 path 使用一级目录名，例如：views/dashboard/index.vue -> /dashboard
// - 路由 name 使用组件导出的 name，没有则回退为目录名（首字母大写）
const viewModules = import.meta.glob('../views/**/index.vue', {
  eager: true,
})

function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

const dynamicRoutes = Object.entries(viewModules).map(([filePath, module]) => {
  const match = filePath.match(/..\/views\/([^/]+)\/index\.vue$/)
  const dirName = match ? match[1] : ''
  const path = `/${dirName}`
  const component = module.default
  const name = component?.name || toPascalCase(dirName)
  const description = component?.description || ''
  return {
    path,
    name,
    component,
    meta: {
      // 菜单显示名称，优先使用组件 name
      title: name,
      description: description,
      // 可以根据需要补充 icon、权限等
    },
  }
})

const routes = [
  {
    path: '/',
    redirect: dynamicRoutes[0]?.path || '/__empty__',
  },
  ...dynamicRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: {
      name: 'NotFound',
      template: '<div style="padding:24px;color:#fff;">页面不存在</div>',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

