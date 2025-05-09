import React from 'react';
import { Layout, Row, Col, Typography, Input, Button, Divider, Space } from 'antd';
import { 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined, 
  FacebookOutlined, 
  InstagramOutlined, 
  TwitterOutlined 
} from '@ant-design/icons';

const { Footer } = Layout;
const { Title, Text, Link } = Typography;

const MilkTeaFooter: React.FC = () => {
  return (
    <div style={{ paddingTop: '2rem' }}>
    <Footer className="bg-amber-800 pt-12 pb-6" style={{ backgroundColor: '#92400e', borderTop: '3px solid #f59e0b' }}>
      <div className="container mx-auto">
        <Row gutter={[32, 24]}>
          <Col xs={24} sm={24} md={8} lg={8}>
            <div className="mb-6">
              <Title level={3} style={{ color: 'white' }} className="font-bold mb-4">Trà Sữa Ngọt Ngào</Title>
              <Text style={{ color: '#e5e7eb' }} className="block mb-4">
                Thưởng thức hương vị trà sữa tuyệt hảo, được làm từ những nguyên liệu tươi ngon nhất.
              </Text>
              <Space direction="vertical" size="small">
                <div className="flex items-center">
                  <PhoneOutlined className="mr-2" style={{ color: 'white' }} />
                  <Text style={{ color: '#e5e7eb' }}>0123 456 789</Text>
                </div>
                <div className="flex items-center">
                  <MailOutlined className="mr-2" style={{ color: 'white' }} />
                  <Text style={{ color: '#e5e7eb' }}>lienhe@trasuangon.com</Text>
                </div>
                <div className="flex items-center">
                  <EnvironmentOutlined className="mr-2" style={{ color: 'white' }} />
                  <Text style={{ color: '#e5e7eb' }}>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</Text>
                </div>
              </Space>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8} lg={8}>
            <Title level={4} style={{ color: 'white' }} className="font-bold mb-4">Giờ Mở Cửa</Title>
            <div className="mb-2">
              <Text style={{ color: '#e5e7eb' }} className="block">Thứ Hai - Thứ Sáu: 8:00 - 22:00</Text>
              <Text style={{ color: '#e5e7eb' }} className="block">Thứ Bảy - Chủ Nhật: 9:00 - 23:00</Text>
            </div>
            
            <Title level={4} style={{ color: 'white' }} className="font-bold mt-6 mb-4">Liên Kết</Title>
            <div className="grid grid-cols-2 gap-2">
              <Link href="#" style={{ color: '#e5e7eb' }} className="hover:text-yellow-300">Trang Chủ</Link>
              <Link href="#" style={{ color: '#e5e7eb' }} className="hover:text-yellow-300">Thực Đơn</Link>
              <Link href="#" style={{ color: '#e5e7eb' }} className="hover:text-yellow-300">Về Chúng Tôi</Link>
              <Link href="#" style={{ color: '#e5e7eb' }} className="hover:text-yellow-300">Khuyến Mãi</Link>
              <Link href="#" style={{ color: '#e5e7eb' }} className="hover:text-yellow-300">Cửa Hàng</Link>
              <Link href="#" style={{ color: '#e5e7eb' }} className="hover:text-yellow-300">Liên Hệ</Link>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8} lg={8}>
            <Title level={4} style={{ color: 'white' }} className="font-bold mb-4">Đăng Ký Nhận Tin</Title>
            <Text style={{ color: '#e5e7eb' }} className="block mb-4">
              Đăng ký để nhận thông tin về sản phẩm mới và ưu đãi đặc biệt.
            </Text>
            <div className="flex mb-6">
              <Input 
                placeholder="Email của bạn" 
                className="rounded-l-md" 
              />
              <Button 
                type="primary" 
                className="bg-yellow-500 border-yellow-500 hover:bg-yellow-600 rounded-r-md"
              >
                Đăng Ký
              </Button>
            </div>
            
            <Title level={4} style={{ color: 'white' }} className="font-bold mb-4">Theo Dõi Chúng Tôi</Title>
            <Space size="middle">
              <Link href="#" style={{ color: 'white' }} className="hover:text-blue-400">
                <FacebookOutlined className="text-2xl" />
              </Link>
              <Link href="#" style={{ color: 'white' }} className="hover:text-pink-400">
                <InstagramOutlined className="text-2xl" />
              </Link>
              <Link href="#" style={{ color: 'white' }} className="hover:text-blue-300">
                <TwitterOutlined className="text-2xl" />
              </Link>
            </Space>
          </Col>
        </Row>

        <Divider className="bg-amber-700 my-6" />
        
        <div className="text-center">
          <Text style={{ color: '#d1d5db' }}>
            &copy; {new Date().getFullYear()} Trà Sữa Ngọt Ngào. Tất cả các quyền được bảo lưu.
          </Text>
        </div>
      </div>
    </Footer>
    </div>
  );
};

export default MilkTeaFooter;