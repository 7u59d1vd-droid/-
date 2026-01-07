import React from 'react';
import { Layout, Button, Typography, Space } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import CesiumMap from '../components/CesiumMap';

const { Header, Content } = Layout;
const { Title } = Typography;

const Dashboard = ({ onLogout }) => {
  const username = localStorage.getItem('username');

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{
        background: 'linear-gradient(90deg, #1890ff 0%, #096dd9 100%)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            智慧水利平台
          </Title>
          <span style={{ color: 'rgba(255,255,255,0.8)', marginLeft: '16px', fontSize: '14px' }}>
            Smart Water Monitoring Platform
          </span>
        </div>
        
        <Space>
          <span style={{ color: 'white' }}>
            <UserOutlined /> {username}
          </span>
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={onLogout}
          >
            退出
          </Button>
        </Space>
      </Header>
      
      <Content style={{ position: 'relative', overflow: 'hidden' }}>
        <CesiumMap />
      </Content>
    </Layout>
  );
};

export default Dashboard;
