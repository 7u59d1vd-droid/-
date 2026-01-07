import React, { useEffect, useState } from 'react';
import { Viewer, Entity, CameraFlyTo, PointGraphics } from 'resium';
import { Cartesian3, Color, Ion, VerticalOrigin } from 'cesium';
import { pointsAPI } from '../api/api';
import { message } from 'antd';
import PointPopup from './PointPopup';

// Set Cesium Ion access token (use default or your own)
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNGQ2MzNkYS03OGM4LTRhZmEtYjM0My0wYjA3NjI2MmZiNzYiLCJpZCI6MjM2NjY2LCJpYXQiOjE3Mjk1ODkxNzJ9.aYWOe0oC5PqJJNBSzqHmL8s4GnPq-CzL8uCVBEJqTfM';

const CesiumMap = () => {
  const [points, setPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [viewerRef, setViewerRef] = useState(null);

  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    try {
      const response = await pointsAPI.getAllPoints();
      setPoints(response.data);
    } catch (error) {
      message.error('加载测点数据失败');
      console.error('Error loading points:', error);
    }
  };

  const handlePointClick = (point) => {
    setSelectedPoint(point);
  };

  const closePopup = () => {
    setSelectedPoint(null);
  };

  // Default camera position (center of China, zoomed out to see all points)
  const defaultPosition = Cartesian3.fromDegrees(116.404, 39.915, 5000);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Viewer
        full
        ref={(ref) => setViewerRef(ref?.cesiumElement)}
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        geocoder={false}
        homeButton={false}
        sceneModePicker={false}
        navigationHelpButton={false}
        scene3DOnly={true}
        style={{ width: '100%', height: '100%' }}
        onMount={(viewer) => {
          // Enable FXAA anti-aliasing
          viewer.scene.postProcessStages.fxaa.enabled = true;
          
          // Enable lighting based on sun position
          viewer.scene.globe.enableLighting = true;
          
          // High contrast rendering
          viewer.scene.highDynamicRange = true;
        }}
      >
        <CameraFlyTo destination={defaultPosition} duration={2} />
        
        {points.map((point) => {
          const position = Cartesian3.fromDegrees(
            point.longitude,
            point.latitude,
            point.elevation || 0
          );
          
          return (
            <Entity
              key={point.id}
              position={position}
              name={point.name}
              description={`${point.location_name} - ${point.point_type}`}
              onClick={() => handlePointClick(point)}
            >
              <PointGraphics
                pixelSize={15}
                color={
                  point.point_type === '水位监测'
                    ? Color.BLUE
                    : Color.RED
                }
                outlineColor={Color.WHITE}
                outlineWidth={2}
                heightReference={0}
                disableDepthTestDistance={Number.POSITIVE_INFINITY}
              />
            </Entity>
          );
        })}
      </Viewer>
      
      {selectedPoint && (
        <PointPopup point={selectedPoint} onClose={closePopup} />
      )}
    </div>
  );
};

export default CesiumMap;
