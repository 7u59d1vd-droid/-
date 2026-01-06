import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE = '/api';

function App() {
  const [dashboardData, setDashboardData] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [waterLevelData, setWaterLevelData] = useState([]);
  const [flowRateData, setFlowRateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchDashboardData();
    fetchAlarms();
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchAlarms();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedStation) {
      fetchStationData(selectedStation);
    }
  }, [selectedStation]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      setDashboardData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchAlarms = async () => {
    try {
      const response = await fetch(`${API_BASE}/alarms?resolved=false`);
      if (!response.ok) throw new Error('Failed to fetch alarms');
      const data = await response.json();
      setAlarms(data);
    } catch (err) {
      console.error('Error fetching alarms:', err);
    }
  };

  const fetchStationData = async (stationId) => {
    try {
      const [levelsRes, flowsRes] = await Promise.all([
        fetch(`${API_BASE}/stations/${stationId}/water-levels`),
        fetch(`${API_BASE}/stations/${stationId}/flow-rates`)
      ]);
      
      const levels = await levelsRes.json();
      const flows = await flowsRes.json();
      
      setWaterLevelData(levels.reverse().map((item, index) => ({
        index: index + 1,
        level: parseFloat(item.water_level.toFixed(2)),
        timestamp: new Date(item.timestamp).toLocaleTimeString()
      })));
      
      setFlowRateData(flows.reverse().map((item, index) => ({
        index: index + 1,
        flow: parseFloat(item.flow_rate.toFixed(2)),
        timestamp: new Date(item.timestamp).toLocaleTimeString()
      })));
    } catch (err) {
      console.error('Error fetching station data:', err);
    }
  };

  if (loading) {
    return <div className="app"><div className="loading">加载中...</div></div>;
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h3>错误</h3>
          <p>{error}</p>
          <button className="refresh-button" onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>🌊 智慧水利平台</h1>
        <p>Smart Water Conservancy Platform - 实时监测与管理系统</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          仪表盘
        </button>
        <button 
          className={`tab ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          数据分析
        </button>
        <button 
          className={`tab ${activeTab === 'alarms' ? 'active' : ''}`}
          onClick={() => setActiveTab('alarms')}
        >
          告警信息 {alarms.length > 0 && `(${alarms.length})`}
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          <div className="dashboard">
            {dashboardData.map(({ station, latestLevel, latestFlow }) => (
              <div 
                key={station.id} 
                className="station-card"
                onClick={() => {
                  setSelectedStation(station.id);
                  setActiveTab('charts');
                }}
                style={{ cursor: 'pointer' }}
              >
                <h3>{station.name}</h3>
                <p className="location">📍 {station.location}</p>
                <span className={`status-badge status-${station.status}`}>
                  {station.status === 'active' ? '运行中' : '离线'}
                </span>
                
                {latestLevel && (
                  <div className="data-item">
                    <span className="label">当前水位</span>
                    <span className="value">{latestLevel.water_level.toFixed(2)} m</span>
                  </div>
                )}
                
                {latestFlow && (
                  <div className="data-item">
                    <span className="label">当前流量</span>
                    <span className="value">{latestFlow.flow_rate.toFixed(2)} m³/s</span>
                  </div>
                )}
                
                {latestLevel && (
                  <div className="data-item">
                    <span className="label">更新时间</span>
                    <span className="value" style={{ fontSize: '0.9em' }}>
                      {new Date(latestLevel.timestamp).toLocaleString('zh-CN')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'charts' && (
        <div className="charts-section">
          <h2>数据分析与趋势</h2>
          
          {!selectedStation && (
            <p style={{ padding: '20px', color: '#666' }}>
              请从仪表盘选择一个监测站查看详细数据
            </p>
          )}
          
          {selectedStation && waterLevelData.length > 0 && (
            <div className="chart-container">
              <h3>水位变化趋势</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={waterLevelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" label={{ value: '时间序列', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: '水位 (m)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="level" 
                    stroke="#667eea" 
                    name="水位"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {selectedStation && flowRateData.length > 0 && (
            <div className="chart-container">
              <h3>流量变化趋势</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={flowRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" label={{ value: '时间序列', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: '流量 (m³/s)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="flow" 
                    stroke="#764ba2" 
                    name="流量"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {activeTab === 'alarms' && (
        <div className="alarms-section">
          <h2>⚠️ 告警信息</h2>
          {alarms.length === 0 ? (
            <p style={{ padding: '20px', color: '#666' }}>暂无未处理的告警</p>
          ) : (
            alarms.map(alarm => (
              <div 
                key={alarm.id} 
                className={`alarm-item alarm-${alarm.severity}`}
              >
                <h4>{alarm.station_name} - {alarm.alarm_type === 'high_water_level' ? '高水位告警' : alarm.alarm_type}</h4>
                <p>{alarm.message}</p>
                <p><strong>严重程度:</strong> {
                  alarm.severity === 'warning' ? '⚠️ 警告' : 
                  alarm.severity === 'critical' ? '🚨 严重' : 
                  alarm.severity
                }</p>
                <p className="timestamp">
                  {new Date(alarm.timestamp).toLocaleString('zh-CN')}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;
