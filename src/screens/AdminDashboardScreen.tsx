import React, { useState } from 'react';
import { Layout, Menu, Typography, Card, Row, Col, Statistic, Button } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  CoffeeOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledLogo = styled.div`
  height: 32px;
  margin: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

const StyledHeader = styled(Header)`
  padding: 0 24px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledContent = styled(Content)`
  margin: 24px 16px;
  padding: 24px;
  background: white;
  min-height: 280px;
`;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const AdminDashboardScreen: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <StyledLayout>
      <Sider trigger={null} collapsible collapsed={collapsed} width={250}>
        <StyledLogo>Milk Tea Admin</StyledLogo>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <DashboardOutlined />,
              label: 'Dashboard',
            },
            {
              key: '2',
              icon: <UserOutlined />,
              label: 'Users',
            },
            {
              key: '3',
              icon: <ShoppingCartOutlined />,
              label: 'Orders',
            },
            {
              key: '4',
              icon: <CoffeeOutlined />,
              label: 'Products',
            },
            {
              key: '5',
              icon: <SettingOutlined />,
              label: 'Settings',
            },
          ]}
        />
      </Sider>
      <Layout>
        <StyledHeader>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Typography.Text strong>Welcome, Admin</Typography.Text>
        </StyledHeader>
        <StyledContent>
          <Title level={2}>Dashboard</Title>
          
          <Row gutter={16}>
            <Col span={6}>
              <StyledCard>
                <Statistic
                  title="Total Sales"
                  value={8846}
                  prefix="$"
                  valueStyle={{ color: '#3f8600' }}
                />
              </StyledCard>
            </Col>
            <Col span={6}>
              <StyledCard>
                <Statistic
                  title="Active Users"
                  value={112}
                  valueStyle={{ color: '#1890ff' }}
                />
              </StyledCard>
            </Col>
            <Col span={6}>
              <StyledCard>
                <Statistic
                  title="Orders Today"
                  value={24}
                  valueStyle={{ color: '#722ed1' }}
                />
              </StyledCard>
            </Col>
            <Col span={6}>
              <StyledCard>
                <Statistic
                  title="Products"
                  value={93}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </StyledCard>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <StyledCard title="Recent Orders">
                <p>Order data will be displayed here</p>
              </StyledCard>
            </Col>
            <Col span={12}>
              <StyledCard title="Popular Products">
                <p>Product statistics will be displayed here</p>
              </StyledCard>
            </Col>
          </Row>
          
          <StyledCard title="Sales Overview">
            <p>Sales chart will be displayed here</p>
          </StyledCard>
        </StyledContent>
      </Layout>
    </StyledLayout>
  );
};

export default AdminDashboardScreen;
