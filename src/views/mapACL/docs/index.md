---
layout: home

hero:
  name: HTMap
  text: 地图防腐层框架
  tagline: 统一的地图接口，支持多种地图引擎，让地图开发更简单
  image:
    src: /hero-image.svg
    alt: HTMap 架构图
  actions:
    - theme: brand
      text: 快速开始
      link: /getting-started
    - theme: alt
      text: 核心概念
      link: /core-concepts

features:
  - icon: 🎯
    title: 统一接口
    details: 提供统一的API接口，屏蔽不同地图引擎的差异，一次开发，多端适配
  - icon: 🚀
    title: 简单易用
    details: 简洁直观的API设计，快速上手，完善的文档和示例，助您高效开发
  - icon: 🔌
    title: 多引擎支持
    details: 支持腾讯地图、MapboxGL、四维图新等主流地图引擎，轻松切换
  - icon: 🎨
    title: 功能丰富
    details: 批量标记点、DOM标记点、线条、多边形、聚合、弹窗、路线规划等功能一应俱全
  - icon: ⚡
    title: 高性能
    details: 优化的渲染策略，支持海量数据展示，流畅的交互体验
  - icon: 🛡️
    title: 类型安全
    details: 完整的TypeScript类型定义，开发更安全，IDE提示更友好
---

## 快速开始

### 安装

```bash
npm install htmap
# 或
yarn add htmap
# 或
pnpm add htmap
```

### 基础使用

```javascript
import HTMap from '@/utils/HTMap/index.js'

// 创建地图
const map = new HTMap('map', {
  engine: 'tencent',
  center: [116.397128, 39.916527],
  zoom: 12
})

await map.init()

// 添加标记点
const markers = new HTMap.Markers({
  map: map,
  geometries: [
    {
      id: 'marker_1',
      lngLat: [116.397128, 39.916527],
      properties: { name: '天安门' },
      styleId: 'default_style'
    }
  ],
  styles: [
    {
      id: 'default_style',
      src: '/pin.png',
      width: 40,
      height: 46
    }
  ]
})
```

## 核心特性

### 🎯 防腐层设计

HTMap 采用防腐层（Anti-Corruption Layer）设计模式，为不同的地图引擎提供统一的抽象接口，使您的业务代码不依赖于特定的地图供应商。

### 🔌 适配器模式

通过适配器模式实现对多种地图引擎的支持，新增地图引擎只需实现对应的适配器即可。

### 📦 开箱即用

提供了标记点、线条、多边形、聚合、弹窗等常用功能，满足大部分地图应用场景。

## 为什么选择 HTMap？

### 解决痛点

- ❌ 地图引擎API差异大，切换成本高
- ❌ 重复编写相似的地图代码
- ❌ 缺乏统一的错误处理和事件管理
- ❌ 性能优化需要深入了解底层API

### HTMap 方案

- ✅ 统一接口，一次开发，多端适配
- ✅ 封装常用功能，开箱即用
- ✅ 完善的错误处理和事件系统
- ✅ 内置性能优化，开发更简单

## 浏览器支持

HTMap 支持所有现代浏览器：

- Chrome >= 64
- Firefox >= 67
- Safari >= 12
- Edge >= 79

## 社区

- [GitHub](https://github.com/your-repo/HTMap)
- [报告问题](https://github.com/your-repo/HTMap/issues)

## 许可证

[MIT License](https://opensource.org/licenses/MIT)

Copyright © 2024-present HTMap Team
