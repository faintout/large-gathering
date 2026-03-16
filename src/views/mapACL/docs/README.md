# HTMap 文档

HTMap 地图防腐层框架的完整文档。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run docs:dev
```

文档将在 `http://localhost:5173` 上运行。

### 3. 构建生产版本

```bash
npm run docs:build
```

构建产物将输出到 `.vitepress/dist` 目录。

### 4. 预览生产版本

```bash
npm run docs:preview
```

## 文档结构

```
HTMapDocs/
├── .vitepress/
│   └── config.mjs          # VitePress配置
├── index.md                # 首页
├── getting-started.md      # 快速开始
├── core-concepts.md        # 核心概念
├── initialization.md       # 地图初始化
├── map-operations.md       # 地图操作
├── markers.md              # 标记点
├── lines.md                # 线条
├── clusters.md             # 聚合
├── polygons.md             # 多边形
├── popup.md                # 弹窗
├── route-planning.md       # 路线规划
├── events.md               # 事件系统
├── best-practices.md       # 最佳实践
├── api-reference.md        # API参考
└── migration-guide.md      # 迁移指南
```

## 故障排查

### 404 错误

如果遇到 404 错误：

1. 确保所有 `.md` 文件都在 `HTMapDocs` 目录的根级别
2. 检查 `.vitepress/config.mjs` 中的链接路径（应该是 `/getting-started` 而不是 `/HTMapDocs/getting-started`）
3. 重启开发服务器

### 端口占用

如果 5173 端口被占用，VitePress 会自动使用下一个可用端口。

## 技术栈

- VitePress 1.0+
- Vue 3
- Markdown

## 许可证

MIT License

