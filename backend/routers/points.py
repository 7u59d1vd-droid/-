from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/points", tags=["monitoring points"])


@router.get("/", response_model=List[schemas.MonitoringPointWithData])
def get_monitoring_points(db: Session = Depends(get_db)):
    """获取所有测点及其最新数据"""
    points = db.query(models.MonitoringPoint).all()
    
    result = []
    for point in points:
        latest_data = (
            db.query(models.MonitoringData)
            .filter(models.MonitoringData.point_id == point.id)
            .order_by(desc(models.MonitoringData.observation_time))
            .first()
        )
        
        point_dict = {
            "id": point.id,
            "name": point.name,
            "location_name": point.location_name,
            "instrument_code": point.instrument_code,
            "installation_time": point.installation_time,
            "elevation": point.elevation,
            "longitude": point.longitude,
            "latitude": point.latitude,
            "point_type": point.point_type,
            "description": point.description,
            "latest_data": latest_data
        }
        result.append(point_dict)
    
    return result


@router.get("/{point_id}", response_model=schemas.PointDataResponse)
def get_point_data(point_id: int, limit: int = 50, db: Session = Depends(get_db)):
    """获取指定测点的详细数据"""
    point = db.query(models.MonitoringPoint).filter(models.MonitoringPoint.id == point_id).first()
    if not point:
        raise HTTPException(status_code=404, detail="Monitoring point not found")
    
    recent_data = (
        db.query(models.MonitoringData)
        .filter(models.MonitoringData.point_id == point_id)
        .order_by(desc(models.MonitoringData.observation_time))
        .limit(limit)
        .all()
    )
    
    return {"point": point, "recent_data": recent_data}


@router.post("/", response_model=schemas.MonitoringPoint)
def create_monitoring_point(point: schemas.MonitoringPointCreate, db: Session = Depends(get_db)):
    """创建新测点"""
    db_point = models.MonitoringPoint(**point.dict())
    db.add(db_point)
    db.commit()
    db.refresh(db_point)
    return db_point


@router.post("/{point_id}/data", response_model=schemas.MonitoringData)
def add_monitoring_data(point_id: int, data: schemas.MonitoringDataBase, db: Session = Depends(get_db)):
    """为测点添加监测数据"""
    point = db.query(models.MonitoringPoint).filter(models.MonitoringPoint.id == point_id).first()
    if not point:
        raise HTTPException(status_code=404, detail="Monitoring point not found")
    
    db_data = models.MonitoringData(**data.dict(), point_id=point_id)
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data
