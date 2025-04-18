import React from 'react';
import { Layout, Typography, Space, Button } from 'antd';
import { ShoppingCartOutlined, PhoneOutlined } from '@ant-design/icons';
import styled from 'styled-components'; 

const { Header: AntHeader } = Layout;
const { Title } = Typography;

// Create a styled version of AntHeader to override default styles
const StyledHeader = styled(AntHeader)`
  background: linear-gradient(to right, #fff8e1, #ffecb3) !important; /* amber-100 to amber-200 */
  color: #d97706 !important; /* amber-800 */
  height: auto !important; /* Override fixed height */
  line-height: normal !important; /* Override fixed line height */
  padding: 12px 24px !important; /* Add proper padding */
  margin-bottom: 20px !important;
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center !important;
  justify-content: space-between !important;
  border-bottom: 2px solid #d97706 !important;
  
  .ant-typography {
    color: #d97706 !important;
  }
  
  @media (max-width: 768px) {
    flex-direction: column !important;
    align-items: center !important;
    gap: 10px;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
`;

const ActionSection = styled.div`
  display: flex;
  align-items: center;
`;

const Header: React.FC = () => {
  return (
    <StyledHeader className="shadow-md z-10 relative">
      {/* Logo and Shop Name */}
      <LogoSection>
        <Title level={3} className="m-0">Trà Sữa Ngọt Ngào</Title>
      </LogoSection>

      {/* Right side elements */}
      <ActionSection>
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
      </ActionSection>
    </StyledHeader>
  );
};

export default Header;
