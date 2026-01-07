# 智慧水利平台 (Smart Water Platform)

基于 FastAPI + React + Cesium 的全栈智慧水利监测平台

## 项目简介

本项目是一个完整的智慧水利监测平台，采用前后端分离架构，提供水利工程测点数据的可视化监测和管理功能。

### 主要功能

- 🔐 **用户认证系统**：JWT 登录/注册，权限管理
- 🗺️ **3D 地图可视化**：基于 Cesium 的地球 3D 渲染
- 📍 **测点标注**：在地图上标注监测点位置
- 📊 **实时数据展示**：查看测点实时监测数据
- 📈 **历史趋势分析**：数据趋势图表展示
- 🎨 **现代化 UI**：渐变配色，美观的用户界面

## 技术栈

### 后端
- Python 3.9+
- FastAPI - 现代 Web 框架
- SQLAlchemy - ORM
- JWT - 身份认证
- SQLite - 数据库

### 前端
- React 18
- CesiumJS - 3D 地球可视化
- Resium - React Cesium 集成
- Ant Design - UI 组件库
- Axios - HTTP 客户端

## 快速开始

### 前置要求

- Python 3.9+
- Node.js 14+
- npm 或 yarn

### 后端安装

1. 进入后端目录并安装依赖：

```bash
cd backend
pip install -r requirements.txt
```

2. 初始化数据库：

```bash
python init_db.py
```

这将创建数据库并导入测点数据。默认账户：
- 管理员: `admin` / `admin123`
- 普通用户: `user` / `admin123`

3. 启动后端服务：

```bash
python main.py
```

后端服务将在 http://localhost:8000 启动

API 文档访问：http://localhost:8000/docs

### 前端安装

1. 进入前端目录并安装依赖：

```bash
cd frontend
npm install
```

2. 启动前端开发服务器：

```bash
npm start
```

前端应用将在 http://localhost:3000 启动

## 项目结构

```
smart-water-platform/
├── backend/                    # Python 后端
│   ├── main.py                 # FastAPI 主应用
│   ├── auth.py                 # JWT 认证
│   ├── models.py               # 数据模型
│   ├── schemas.py              # Pydantic 模式
│   ├── database.py             # 数据库配置
│   ├── init_db.py              # 数据库初始化
│   ├── routers/                # API 路由
│   │   ├── users.py            # 用户接口
│   │   └── points.py           # 测点接口
│   ├── requirements.txt        # Python 依赖
│   └── README.md
├── frontend/                   # React 前端
│   ├── public/                 # 静态文件
│   │   ├── index.html
│   │   └── models/             # 3D 模型
│   ├── src/
│   │   ├── App.js              # 主应用
│   │   ├── index.js            # 入口
│   │   ├── api/                # API 封装
│   │   ├── components/         # React 组件
│   │   ├── pages/              # 页面组件
│   │   └── styles/             # 样式文件
│   ├── package.json
│   └── README.md
├── D3（包含监测仪器）.rvt      # Revit 模型文件
├── 监测资料.xlsx                # 监测数据
├── 课程设计任务及指导书.docx    # 设计文档
├── .gitignore
└── README.md
```

## 使用说明

### 1. 登录系统

访问 http://localhost:3000，使用默认账户登录：
- 用户名: `admin`
- 密码: `admin123`

或者点击"注册"创建新账户。

### 2. 查看地图

登录后进入主控台，可以看到 Cesium 3D 地图。地图上标注了所有监测点：
- 🔴 红色标记：位移监测点
- 🔵 蓝色标记：水位监测点

### 3. 查看测点数据

点击地图上的任意测点标记，右侧会弹出数据面板，显示：
- 测点基本信息（位置、编号、高程等）
- 最新监测数据
- 历史数据趋势图

## API 接口

### 用户认证
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/me` - 获取当前用户信息

### 测点数据
- `GET /api/points/` - 获取所有测点及最新数据
- `GET /api/points/{point_id}` - 获取指定测点详细数据
- `POST /api/points/` - 创建新测点
- `POST /api/points/{point_id}/data` - 添加监测数据

完整 API 文档：http://localhost:8000/docs

## 数据说明

项目使用的监测数据来自 `监测资料.xlsx`，包含：
- 8 个监测点（7个坝段位移监测点 + 1个水位监测站）
- 时间跨度：2018年6月至2020年2月
- 监测指标：库水位、位移等

## 特性亮点

### 地图优化
- ✅ FXAA 抗锯齿，画面更流畅
- ✅ 地球光照效果，更真实的视觉体验
- ✅ 高对比度测点标注，易于识别
- ✅ 无深度测试距离，标注始终可见

### UI 设计
- ✅ 渐变配色，现代化视觉效果
- ✅ Ant Design 组件，一致的用户体验
- ✅ 响应式布局，支持多种屏幕尺寸
- ✅ 流畅的动画过渡

## 开发计划

- [ ] 导入 Revit 模型到 Cesium
- [ ] 添加更多数据可视化图表
- [ ] 实现数据导出功能
- [ ] 添加告警功能
- [ ] 支持数据实时更新

## 问题排查

### 后端问题

如果后端启动失败：
1. 检查 Python 版本：`python --version` (需要 3.9+)
2. 重新安装依赖：`pip install -r requirements.txt`
3. 删除数据库后重新初始化：`rm smart_water.db && python init_db.py`

### 前端问题

如果前端启动失败：
1. 检查 Node.js 版本：`node --version` (需要 14+)
2. 删除 node_modules 重新安装：`rm -rf node_modules && npm install`
3. 清除缓存：`npm cache clean --force`

### Cesium 地图不显示

1. 检查浏览器是否支持 WebGL
2. 检查浏览器控制台是否有错误
3. 确认 Cesium 静态资源已正确复制到 public 目录

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue 或联系项目维护者。