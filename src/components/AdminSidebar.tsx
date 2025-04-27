import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const AdminSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Bảng Điều Khiển',
    },
    {
      key: '/admin/accounts',
      icon: <UserOutlined />,
      label: 'Quản Lý Tài Khoản',
    },
    {
      key: '/admin/categories',
      icon: <ShoppingOutlined />,
      label: 'Quản Lý Danh Mục Sản Phẩm',
    },
  ];

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="h-full min-h-screen bg-white shadow-md flex flex-col"
      style={{ position: 'sticky', top: 0, left: 0, height: '100vh', overflow: 'auto' }}
    >
      <div className="flex h-16 items-center justify-center">
        <h1 className={`text-primary transition-all duration-300 ${collapsed ? 'text-xl' : 'text-2xl'} font-bold`}>
          {collapsed ? 'MT' : 'MilkTea'}
        </h1>
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        className="border-r-0 flex-1"
        items={menuItems}
        onClick={({ key }) => handleMenuClick(key)}
      />
    </Sider>
  );
};

export default AdminSidebar;
