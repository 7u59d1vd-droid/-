# Smart Water Platform - Frontend

基于 React + Cesium 的智慧水利平台前端

## 功能特性

- ✅ 美观的登录/注册界面
- ✅ Cesium 3D 地图可视化
- ✅ 测点位置标注和实时数据展示
- ✅ 数据趋势图表
- ✅ 响应式设计
- ✅ 现代化 UI（Ant Design）

## 技术栈

- React 18
- CesiumJS - 3D 地球可视化
- Resium - React Cesium 集成
- Ant Design - UI 组件库
- @ant-design/charts - 数据可视化
- Axios - HTTP 客户端

## 安装运行

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 配置环境变量（可选）

创建 `.env` 文件：

```
REACT_APP_API_URL=http://localhost:8000/api
```

如果不配置，默认使用 `http://localhost:8000/api`

### 3. 启动开发服务器

```bash
npm start
```

应用将在 http://localhost:3000 启动

### 4. 构建生产版本

```bash
npm run build
```

构建的静态文件将输出到 `build/` 目录

## 目录结构

```
frontend/
├── public/
│   ├── index.html          # HTML 模板
│   ├── Cesium.js           # Cesium 库
│   ├── Widgets/            # Cesium UI 组件
│   └── models/             # 3D 模型文件（待添加）
├── src/
│   ├── App.js              # 主应用组件
│   ├── index.js            # 入口文件
│   ├── api/
│   │   └── api.js          # 后端 API 封装
│   ├── components/
│   │   ├── LoginForm.js    # 登录/注册表单
│   │   ├── CesiumMap.js    # Cesium 地图组件
│   │   └── PointPopup.js   # 测点弹窗
│   ├── pages/
│   │   ├── LoginPage.js    # 登录页面
│   │   └── Dashboard.js    # 主控台页面
│   └── styles/
│       └── main.css        # 全局样式
├── package.json
└── README.md
```

## 主要组件

### LoginForm
用户登录和注册表单组件，支持：
- 用户名/密码登录
- 邮箱注册
- 表单验证
- JWT Token 管理

### CesiumMap
Cesium 3D 地图组件，特性：
- 3D 地球可视化
- FXAA 抗锯齿
- 地球光照效果
- 高对比度渲染
- 测点标注（红色-位移监测，蓝色-水位监测）
- 点击交互

### PointPopup
测点数据弹窗组件，显示：
- 测点基本信息
- 最新监测数据
- 历史数据趋势图

### Dashboard
主控台页面，包含：
- 顶部导航栏
- 用户信息显示
- Cesium 地图
- 退出登录功能

## 使用说明

### 登录系统
使用默认账户：
- 用户名: `admin` 或 `user`
- 密码: `admin123`

或注册新账户

### 查看测点
登录后，地图上会显示所有测点标记：
- 红色标记：位移监测点
- 蓝色标记：水位监测点

### 查看数据
点击任意测点标记，右侧会弹出详细信息面板，包括：
- 测点基本信息
- 最新监测数据
- 历史数据趋势图

## 地图优化

已启用的优化选项：
- FXAA 抗锯齿
- 基于太阳位置的地球光照
- 高动态范围渲染
- 禁用深度测试以确保标注可见

## 样式定制

主要使用了渐变配色方案：
- 主题色：紫色渐变 (`#667eea` -> `#764ba2`)
- 强调色：蓝色 (`#1890ff`)

可以在 `src/styles/main.css` 中自定义样式。

## 浏览器兼容性

推荐使用现代浏览器：
- Chrome (推荐)
- Firefox
- Edge
- Safari

需要支持 WebGL 才能正常渲染 Cesium 地图。
