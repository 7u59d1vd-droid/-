from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")  # user, admin
    created_at = Column(DateTime, default=datetime.utcnow)


class MonitoringPoint(Base):
    __tablename__ = "monitoring_points"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location_name = Column(String)  # 平面位置
    instrument_code = Column(String)  # 仪器编号
    installation_time = Column(DateTime)  # 埋设时间
    elevation = Column(Float)  # 高程
    longitude = Column(Float)  # 经度
    latitude = Column(Float)  # 纬度
    point_type = Column(String)  # 测点类型
    description = Column(String, nullable=True)
    
    data = relationship("MonitoringData", back_populates="point")


class MonitoringData(Base):
    __tablename__ = "monitoring_data"

    id = Column(Integer, primary_key=True, index=True)
    point_id = Column(Integer, ForeignKey("monitoring_points.id"))
    observation_time = Column(DateTime, index=True)
    water_level = Column(Float, nullable=True)  # 库水位
    displacement = Column(Float, nullable=True)  # 位移
    value = Column(Float, nullable=True)  # 通用数值
    unit = Column(String, nullable=True)
    
    point = relationship("MonitoringPoint", back_populates="data")
