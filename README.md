# DERING 珠宝官网（前端）

DERING 珠宝品牌展示与订购前端，使用 Vue 3 和 Vite 构建。网站包含品牌首页、产品目录、系列页面、工艺与购买指南、用户注册/登录、购物车、订单导出以及管理员后台。

## 技术栈

- Vue 3（Composition API）
- Vue Router 4
- Vite 6
- pnpm

## 环境要求

- Node.js 18+
- pnpm 8+
- 后端服务运行在 `http://127.0.0.1:3001`（开发服务器会自动代理 `/api` 请求）

## 安装与启动

在 `vue` 目录执行：

```bash
pnpm install
pnpm dev
```

默认访问地址：<http://localhost:5173>

Vite 配置中的 `/api` 代理指向 `http://127.0.0.1:3001`。如果修改后端端口，请同步修改 `vite.config.js` 中的 `server.proxy` 和 `preview.proxy`。

## 构建与预览

```bash
# 生产构建，输出到 dist/
pnpm build

# 本地预览生产构建
pnpm preview
```

## 页面路由

| 路径 | 页面 |
| --- | --- |
| `/` | 品牌首页 |
| `/products` | 产品目录、筛选和产品详情 |
| `/series/:slug` | 产品系列展示 |
| `/about` | 品牌介绍 |
| `/process`、`/4c`、`/advantages` | 工艺、钻石 4C 和产品优势 |
| `/buying-guide`、`/faq` | 购买指南和常见问题 |
| `/contact` | 联系与咨询 |
| `/search` | 产品搜索 |
| `/register`、`/login` | 用户注册和登录 |
| `/cart`、`/orders` | 购物车和订单 |
| `/deringad` | 管理员登录 |
| `/admin/dashboard` | 管理员后台（需要管理员账号） |

## 前后端协作

产品数据、用户认证和订单导出通过后端 `/api` 接口完成。启动完整开发环境时，建议先启动后端，再启动前端：

```text
浏览器 → Vite（5173） → /api 代理 → FastAPI（3001） → MySQL
```

后端 Swagger 文档地址为 <http://localhost:3001/docs>。

## 项目结构

```text
vue/
├─ public/             # logo、图片、视频等静态资源
├─ src/
│  ├─ views/           # 页面级组件
│  ├─ components/      # 可复用组件
│  ├─ composables/     # 认证、购物车、订单、语言状态
│  ├─ content/         # 站点文案
│  ├─ styles/          # 全局样式
│  ├─ utils/            # 货币和产品本地化工具
│  ├─ App.vue          # 全局布局和导航
│  └─ main.js          # 应用入口与路由
├─ vite.config.js
└─ package.json
```

## 本地数据与资源

- 登录用户保存在浏览器 `localStorage` 的 `dering-current-user` 键中。
- 购物车按用户保存在 `dering-cart-items:<user>` 键中，订单历史保存在 `dering-order-history` 键中。
- 图片、logo 和视频位于 `public/`，构建时会原样复制到 `dist/`。
- 首页视频等大文件可能使用 Git LFS；克隆后若资源缺失，请安装 Git LFS 并执行 `git lfs pull`。

## 开发约定

- 页面组件放在 `src/views`，跨页面状态放在 `src/composables`。
- 新增后端请求时使用 `/api/...` 相对路径，以便开发和预览环境复用代理配置。
- 提交前运行 `pnpm build`，确保 Vue 模板、路由和静态资源都能通过生产构建。
