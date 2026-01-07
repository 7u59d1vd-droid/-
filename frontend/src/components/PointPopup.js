import React, { useEffect, useState } from 'react';
import { Card, Spin, Tag, Descriptions, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { pointsAPI } from '../api/api';
import { Line } from '@ant-design/charts';

const PointPopup = ({ point, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [pointData, setPointData] = useState(null);

  useEffect(() => {
    loadPointData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point.id]);

  const loadPointData = async () => {
    try {
      const response = await pointsAPI.getPointData(point.id, 30);
      setPointData(response.data);
    } catch (error) {
      console.error('Error loading point data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN');
  };

  const getChartData = () => {
    if (!pointData || !pointData.recent_data) return [];
    
    return pointData.recent_data
      .slice()
      .reverse()
      .map(d => ({
        time: formatDate(d.observation_time),
        value: d.displacement || d.value || 0,
        type: point.point_type
      }));
  };

  const chartConfig = {
    data: getChartData(),
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    xAxis: {
      label: {
        autoRotate: true,
        autoHide: true,
      },
    },
    yAxis: {
      label: {
        formatter: (v) => `${v} ${point.latest_data?.unit || ''}`,
      },
    },
    point: {
      size: 3,
      shape: 'circle',
    },
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      width: '450px',
      maxHeight: 'calc(100vh - 40px)',
      overflowY: 'auto',
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{point.name}</span>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
            />
          </div>
        }
        bordered={false}
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '8px',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="位置">
                {point.location_name}
              </Descriptions.Item>
              <Descriptions.Item label="仪器编号">
                {point.instrument_code || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="高程">
                {point.elevation ? `${point.elevation} m` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="测点类型">
                <Tag color={point.point_type === '水位监测' ? 'blue' : 'red'}>
                  {point.point_type}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {point.latest_data && (
              <div style={{ marginTop: '16px' }}>
                <h4>最新数据</h4>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="观测时间">
                    {formatDate(point.latest_data.observation_time)}
                  </Descriptions.Item>
                  {point.latest_data.water_level && (
                    <Descriptions.Item label="库水位">
                      {point.latest_data.water_level} m
                    </Descriptions.Item>
                  )}
                  {point.latest_data.displacement && (
                    <Descriptions.Item label="位移">
                      {point.latest_data.displacement} {point.latest_data.unit || 'mm'}
                    </Descriptions.Item>
                  )}
                  {point.latest_data.value && (
                    <Descriptions.Item label="数值">
                      {point.latest_data.value} {point.latest_data.unit || ''}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </div>
            )}

            {pointData && pointData.recent_data && pointData.recent_data.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h4>历史趋势</h4>
                <Line {...chartConfig} height={200} />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default PointPopup;
