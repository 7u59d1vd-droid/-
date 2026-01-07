# Smart Water Platform - Backend

基于 FastAPI 的智慧水利平台后端 API 服务

## 功能特性

- ✅ JWT 用户认证（登录/注册）
- ✅ 测点数据管理
- ✅ 实时监测数据查询
- ✅ RESTful API 设计
- ✅ SQLite 数据库存储

## 技术栈

- Python 3.9+
- FastAPI
- SQLAlchemy (ORM)
- JWT (python-jose)
- Passlib (密码加密)
- Pandas (Excel 数据解析)

## 安装运行

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 初始化数据库

```bash
python init_db.py
```

这将创建数据库并导入测点数据。默认创建的账户：
- 管理员: `admin` / `admin123`
- 普通用户: `user` / `admin123`

### 3. 启动服务

```bash
python main.py
```

或使用 uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

服务将在 http://localhost:8000 启动

## API 文档

启动服务后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 主要 API 端点

### 用户认证
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/me` - 获取当前用户信息

### 测点数据
- `GET /api/points/` - 获取所有测点及最新数据
- `GET /api/points/{point_id}` - 获取指定测点详细数据
- `POST /api/points/` - 创建新测点
- `POST /api/points/{point_id}/data` - 添加监测数据

## 项目结构

```
backend/
├── main.py              # FastAPI 主应用
├── database.py          # 数据库配置
├── models.py            # SQLAlchemy 模型
├── schemas.py           # Pydantic 数据模式
├── auth.py              # JWT 认证逻辑
├── init_db.py           # 数据库初始化脚本
├── routers/             # API 路由
│   ├── users.py         # 用户相关接口
│   └── points.py        # 测点相关接口
└── requirements.txt     # 依赖包列表
```

## 数据模型

### User (用户)
- id: 用户ID
- username: 用户名
- email: 邮箱
- role: 角色 (user/admin)

### MonitoringPoint (监测点)
- id: 测点ID
- name: 测点名称
- location_name: 平面位置
- instrument_code: 仪器编号
- elevation: 高程
- longitude/latitude: 经纬度坐标
- point_type: 测点类型

### MonitoringData (监测数据)
- id: 数据ID
- point_id: 关联测点ID
- observation_time: 观测时间
- water_level: 库水位
- displacement: 位移值
- value: 通用数值
- unit: 单位
