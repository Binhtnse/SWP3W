import React from 'react';
import { Layout, Typography, Space, Button } from 'antd';
import { ShoppingCartOutlined, PhoneOutlined } from '@ant-design/icons';
import logo from '../assets/logo.png'; // Assuming you have a logo in this path

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC = () => {
  return (
    <AntHeader className="bg-gradient-to-r from-amber-100 to-amber-200 px-4 py-2 flex items-center justify-between shadow-md">
      {/* Logo and Shop Name */}
      <div className="flex items-center">
        <img 
          src={logo} 
          alt="Logo Trà Sữa" 
          className="h-12 w-12 mr-3"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/48?text=TS';
          }}
        />
        <Title level={3} className="m-0 text-amber-800">Trà Sữa Ngọt Ngào</Title>
      </div>

      {/* Right side elements */}
      <Space size="large">
        <div className="hidden sm:flex items-center">
          <PhoneOutlined className="text-amber-800 text-xl mr-2" />
          <span className="text-amber-800 font-medium">Đặt Hàng: 123-456-7890</span>
        </div>
        
        <Button 
          type="primary" 
          icon={<ShoppingCartOutlined />}
          size="large"
          className="bg-amber-700 hover:bg-amber-800 border-amber-700"
        >
          Giỏ Hàng
        </Button>
      </Space>
    </AntHeader>
  );
};

export default Header;
