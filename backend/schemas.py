from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class User(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# Monitoring Point schemas
class MonitoringPointBase(BaseModel):
    name: str
    location_name: str
    instrument_code: Optional[str] = None
    elevation: Optional[float] = None
    longitude: float
    latitude: float
    point_type: str
    description: Optional[str] = None


class MonitoringPointCreate(MonitoringPointBase):
    installation_time: Optional[datetime] = None


class MonitoringPoint(MonitoringPointBase):
    id: int
    installation_time: Optional[datetime] = None

    class Config:
        from_attributes = True


# Monitoring Data schemas
class MonitoringDataBase(BaseModel):
    observation_time: datetime
    water_level: Optional[float] = None
    displacement: Optional[float] = None
    value: Optional[float] = None
    unit: Optional[str] = None


class MonitoringDataCreate(MonitoringDataBase):
    point_id: int


class MonitoringData(MonitoringDataBase):
    id: int
    point_id: int

    class Config:
        from_attributes = True


class MonitoringPointWithData(MonitoringPoint):
    latest_data: Optional[MonitoringData] = None


class PointDataResponse(BaseModel):
    point: MonitoringPoint
    recent_data: List[MonitoringData]
