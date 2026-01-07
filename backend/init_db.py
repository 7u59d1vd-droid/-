import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models

# Create all tables
Base.metadata.create_all(bind=engine)


def parse_monitoring_data():
    """Parse Excel monitoring data"""
    df = pd.read_excel('../监测资料.xlsx')
    
    # The Excel file has a complex structure
    # Let's create sample monitoring points based on the dam sections
    monitoring_points = [
        {
            "name": "1号坝段监测点",
            "location_name": "坝左0+030.00",
            "instrument_code": "IP1",
            "elevation": 153.0,
            "longitude": 116.404 + 0.001,  # Sample coordinates near Beijing
            "latitude": 39.915 + 0.001,
            "point_type": "位移监测"
        },
        {
            "name": "2号坝段监测点",
            "location_name": "坝左0+060.00",
            "instrument_code": "IP2",
            "elevation": 154.0,
            "longitude": 116.404 + 0.002,
            "latitude": 39.915 + 0.002,
            "point_type": "位移监测"
        },
        {
            "name": "3号坝段监测点",
            "location_name": "坝左0+090.00",
            "instrument_code": "IP3",
            "elevation": 155.0,
            "longitude": 116.404 + 0.003,
            "latitude": 39.915 + 0.003,
            "point_type": "位移监测"
        },
        {
            "name": "4号坝段监测点",
            "location_name": "坝左0+120.00",
            "instrument_code": "IP4",
            "elevation": 156.0,
            "longitude": 116.404 + 0.004,
            "latitude": 39.915 + 0.004,
            "point_type": "位移监测"
        },
        {
            "name": "5号坝段监测点",
            "location_name": "坝左0+150.00",
            "instrument_code": "IP5",
            "elevation": 157.0,
            "longitude": 116.404 + 0.005,
            "latitude": 39.915 + 0.005,
            "point_type": "位移监测"
        },
        {
            "name": "6号坝段监测点",
            "location_name": "坝右0+030.00",
            "instrument_code": "IP6",
            "elevation": 158.0,
            "longitude": 116.404 + 0.006,
            "latitude": 39.915 - 0.001,
            "point_type": "位移监测"
        },
        {
            "name": "7号坝段监测点",
            "location_name": "坝右0+060.00",
            "instrument_code": "IP7",
            "elevation": 159.0,
            "longitude": 116.404 + 0.007,
            "latitude": 39.915 - 0.002,
            "point_type": "位移监测"
        },
        {
            "name": "水位监测站",
            "location_name": "水库中心",
            "instrument_code": "WL1",
            "elevation": 140.0,
            "longitude": 116.404,
            "latitude": 39.915,
            "point_type": "水位监测"
        }
    ]
    
    return monitoring_points, df


def init_database():
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_points = db.query(models.MonitoringPoint).count()
        if existing_points > 0:
            print("Database already initialized. Skipping...")
            return
        
        # Create default admin user
        admin_user = models.User(
            username="admin",
            email="admin@smartwater.com",
            hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5yvJ5C.xqNmCy",  # "admin123"
            role="admin"
        )
        db.add(admin_user)
        
        # Create test user
        test_user = models.User(
            username="user",
            email="user@smartwater.com",
            hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5yvJ5C.xqNmCy",  # "admin123"
            role="user"
        )
        db.add(test_user)
        
        # Parse monitoring data from Excel
        monitoring_points, df = parse_monitoring_data()
        
        # Create monitoring points
        point_objects = []
        for point_data in monitoring_points:
            point = models.MonitoringPoint(**point_data)
            db.add(point)
            db.flush()  # Get the ID
            point_objects.append(point)
        
        # Add some sample monitoring data
        # Extract water level data from Excel
        water_level_data = []
        for idx, row in df.iterrows():
            if idx >= 6 and idx < 100:  # Skip header rows, take first 94 data rows
                try:
                    time_val = row['部位']
                    water_level = row['库水位m']
                    
                    if pd.notna(time_val) and pd.notna(water_level):
                        if isinstance(time_val, datetime):
                            water_level_data.append({
                                'time': time_val,
                                'level': float(water_level)
                            })
                except:
                    continue
        
        # Add monitoring data for each point
        for i, point in enumerate(point_objects[:-1]):  # All except water level station
            for j, wl_data in enumerate(water_level_data):
                if j % 3 == 0:  # Add every 3rd record to reduce data volume
                    # Add displacement data with some variation
                    displacement = 0.1 + (i * 0.05) + (j * 0.01)
                    data = models.MonitoringData(
                        point_id=point.id,
                        observation_time=wl_data['time'],
                        water_level=wl_data['level'],
                        displacement=displacement,
                        value=displacement,
                        unit="mm"
                    )
                    db.add(data)
        
        # Add water level data to water level station
        water_level_point = point_objects[-1]
        for wl_data in water_level_data:
            data = models.MonitoringData(
                point_id=water_level_point.id,
                observation_time=wl_data['time'],
                water_level=wl_data['level'],
                value=wl_data['level'],
                unit="m"
            )
            db.add(data)
        
        db.commit()
        print("Database initialized successfully!")
        print(f"Created {len(point_objects)} monitoring points")
        print(f"Created monitoring data records")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
