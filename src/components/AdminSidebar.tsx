import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
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
    {
      key: '/admin/orders',
      icon: <ShoppingCartOutlined />,
      label: 'Quản Lý Đơn Hàng',
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
      className="min-h-screen bg-white shadow-md"
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
        className="border-r-0"
        items={menuItems}
        onClick={({ key }) => handleMenuClick(key)}
      />
    </Sider>
  );
};

export default AdminSidebar;
