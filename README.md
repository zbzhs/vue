# 戴莉珠宝官网

这是一个基于 Vue 3 + Vite 构建的珠宝品牌展示官网，用于呈现品牌形象、产品系列、珠宝工艺和预约咨询入口。项目采用单页应用结构，通过 Vue Router 管理多个页面，首页包含品牌视觉大屏、视频背景和精选系列展示。

## 项目功能

- 品牌首页：视频背景首屏、滚轮切换视觉页、精选系列入口
- 产品展示：展示钻戒、项链、彩宝戒、耳坠等珠宝产品
- 品牌介绍：说明品牌定位、设计理念和服务方向
- 珠宝工艺：展示宝石甄选、设计建模、镶嵌抛光等流程
- 联系我们：提供预约咨询表单和联系方式
- 响应式布局：适配桌面端和移动端浏览

## 技术栈

- Vue 3
- Vue Router
- Vite
- pnpm

## 目录结构

```text
vue/
|-- public/              # 静态资源
|   |-- logo/            # 品牌 logo
|   `-- video/           # 首页视频资源
|-- screenshots/         # 页面截图
|-- src/
|   |-- views/           # 页面组件
|   |   |-- HomeView.vue
|   |   |-- ProductsView.vue
|   |   |-- AboutView.vue
|   |   |-- CraftView.vue
|   |   `-- ContactView.vue
|   |-- styles/          # 全局样式
|   |-- App.vue          # 应用布局和导航
|   `-- main.js          # 应用入口和路由配置
|-- index.html
|-- package.json
`-- vite.config.js
```

## 本地运行

安装依赖：

```bash
pnpm install
```

启动开发服务器：

```bash
pnpm dev
```

默认访问地址：

```text
http://localhost:5173
```

## 打包构建

```bash
pnpm build
```

构建完成后，产物会生成在 `dist/` 目录。

## 本地预览构建结果

```bash
pnpm preview
```

## 资源说明

首页视频文件位于 `public/video/video.mp4`。由于视频文件较大，仓库已使用 Git LFS 管理 `.mp4` 文件，克隆项目后如需完整视频资源，请确保本机已安装 Git LFS。
