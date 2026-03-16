import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "HTMap",
  description: "HTMap 地图防腐层框架文档",
  base: '/mapACLdoc/',
  outDir: 'mapACLdoc',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/getting-started' },
      { text: '核心概念', link: '/core-concepts' },
      { text: 'API参考', link: '/api-reference' }
    ],

    sidebar: [
      {
        text: '指南',
        items: [
          { text: '简介', link: '/' },
          { text: '快速开始', link: '/getting-started' },
          { text: '核心概念', link: '/core-concepts' },
          { text: '地图初始化', link: '/initialization' }
        ]
      },
      {
        text: '基础功能',
        items: [
          { text: '地图操作', link: '/map-operations' },
          { text: '标记点 (Markers)', link: '/markers' },
          { text: '线条 (Lines)', link: '/lines' },
          { text: '聚合 (Clusters)', link: '/clusters' },
          { text: '多边形 (Polygons)', link: '/polygons' },
          { text: '弹窗 (Popup)', link: '/popup' }
        ]
      },
      {
        text: '高级功能',
        items: [
          { text: '路线规划', link: '/route-planning' },
          { text: '事件系统', link: '/events' }
        ]
      },
      {
        text: '其他',
        items: [
          { text: 'API参考', link: '/api-reference' },
          { text: '最佳实践', link: '/best-practices' },
          { text: '迁移指南', link: '/migration-guide' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-repo/HTMap' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present HTMap Team'
    },

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: '目录'
    }
  }
})
