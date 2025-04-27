import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreAddOutlined, // Icon cho quản lý sản phẩm
  AppstoreOutlined, // Icon cho quản lý combo
  PlusCircleOutlined, // Icon cho quản lý extra product
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const ManagerSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/manager/orderList',
      icon: <ShoppingCartOutlined />,
      label: 'Quản Lý Đơn Hàng',
    },
    {
      key: '/manager/listProduct',
      icon: <AppstoreAddOutlined />,
      label: 'Quản Lý Trà sữa',
    },
    {
      key: '/manager/listCombo',
      icon: <AppstoreOutlined />,
      label: 'Quản Lý Combo',
    },
    {
      key: '/manager/manageExtraProduct',
      icon: <PlusCircleOutlined />,
      label: 'Quản Lý Extra Product',
    },
    {
      key: '/manager/manageIncome',
      icon: <DashboardOutlined />,
      label: 'Tổng Quan',
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
          {collapsed ? 'TSNN' : 'Trà Sữa Ngọt Ngào'}
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

export default ManagerSidebar;
