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
    <Footer className="bg-amber-800 text-white pt-12 pb-6">
      <div className="container mx-auto">
        <Row gutter={[32, 24]}>
          <Col xs={24} sm={24} md={8} lg={8}>
            <div className="mb-6">
              <Title level={3} className="text-white font-bold mb-4">Trà Sữa Ngon Ngon</Title>
              <Text className="text-gray-200 block mb-4">
                Thưởng thức hương vị trà sữa tuyệt hảo, được làm từ những nguyên liệu tươi ngon nhất.
              </Text>
              <Space direction="vertical" size="small">
                <div className="flex items-center">
                  <PhoneOutlined className="mr-2" />
                  <Text className="text-gray-200">0123 456 789</Text>
                </div>
                <div className="flex items-center">
                  <MailOutlined className="mr-2" />
                  <Text className="text-gray-200">lienhe@trasuangon.com</Text>
                </div>
                <div className="flex items-center">
                  <EnvironmentOutlined className="mr-2" />
                  <Text className="text-gray-200">123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</Text>
                </div>
              </Space>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8} lg={8}>
            <Title level={4} className="text-white font-bold mb-4">Giờ Mở Cửa</Title>
            <div className="mb-2">
              <Text className="text-gray-200 block">Thứ Hai - Thứ Sáu: 8:00 - 22:00</Text>
              <Text className="text-gray-200 block">Thứ Bảy - Chủ Nhật: 9:00 - 23:00</Text>
            </div>
            
            <Title level={4} className="text-white font-bold mt-6 mb-4">Liên Kết</Title>
            <div className="grid grid-cols-2 gap-2">
              <Link href="#" className="text-gray-200 hover:text-yellow-300">Trang Chủ</Link>
              <Link href="#" className="text-gray-200 hover:text-yellow-300">Thực Đơn</Link>
              <Link href="#" className="text-gray-200 hover:text-yellow-300">Về Chúng Tôi</Link>
              <Link href="#" className="text-gray-200 hover:text-yellow-300">Khuyến Mãi</Link>
              <Link href="#" className="text-gray-200 hover:text-yellow-300">Cửa Hàng</Link>
              <Link href="#" className="text-gray-200 hover:text-yellow-300">Liên Hệ</Link>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8} lg={8}>
            <Title level={4} className="text-white font-bold mb-4">Đăng Ký Nhận Tin</Title>
            <Text className="text-gray-200 block mb-4">
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
            
            <Title level={4} className="text-white font-bold mb-4">Theo Dõi Chúng Tôi</Title>
            <Space size="middle">
              <Link href="#" className="text-white hover:text-blue-400">
                <FacebookOutlined className="text-2xl" />
              </Link>
              <Link href="#" className="text-white hover:text-pink-400">
                <InstagramOutlined className="text-2xl" />
              </Link>
              <Link href="#" className="text-white hover:text-blue-300">
                <TwitterOutlined className="text-2xl" />
              </Link>
            </Space>
          </Col>
        </Row>

        <Divider className="bg-amber-700 my-6" />
        
        <div className="text-center">
          <Text className="text-gray-300">
            &copy; {new Date().getFullYear()} Trà Sữa Ngon Ngon. Tất cả các quyền được bảo lưu.
          </Text>
        </div>
      </div>
    </Footer>
  );
};

export default MilkTeaFooter;
