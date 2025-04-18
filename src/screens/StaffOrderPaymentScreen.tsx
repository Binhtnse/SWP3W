import React, { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { 
  Button, 
  Typography, 
  Divider, 
  Card, 
  message, 
  Spin,
  Result,
  Steps,
  Row,
  Col,
  Tag,
  Descriptions
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CheckCircleOutlined,
  QrcodeOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import styled from 'styled-components';

const { Text} = Typography;
const { Step } = Steps;

const StyledHeader = styled.div`
  background: linear-gradient(to right, #7c3aed, #4f46e5) !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  margin-bottom: 1.5rem !important;
  padding: 1.5rem !important;
`;

const HeaderContent = styled.div`
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  align-items: center !important;

  @media (min-width: 768px) {
    flex-direction: row !important;
  }
`;

const LogoSection = styled.div`
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  margin-bottom: 1rem !important;

  @media (min-width: 768px) {
    flex-direction: row !important;
    margin-bottom: 0 !important;
  }
`;

const IconContainer = styled.div`
  background-color: white !important;
  padding: 0.75rem !important;
  border-radius: 9999px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
  margin-right: 1rem !important;
  margin-bottom: 0.75rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;

  @media (min-width: 768px) {
    margin-bottom: 0 !important;
  }

  .anticon {
    font-size: 1.875rem !important;
    color: #7c3aed !important;
  }
`;

const TitleContainer = styled.div`
  h1 {
    font-size: 1.875rem !important;
    font-weight: 700 !important;
    color: white !important;
    text-align: center !important;

    @media (min-width: 768px) {
      text-align: left !important;
    }
  }

  p {
    color: #ddd6fe !important;
    margin-top: 0.25rem !important;
    display: flex !important;
    align-items: center !important;
    text-align: center !important;

    @media (min-width: 768px) {
      text-align: left !important;
    }
  }
`;

const ContentSection = styled.div`
  background: white !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  padding: 1.5rem !important;
  margin-bottom: 1.5rem !important;
`;

const ActionButton = styled(Button)`
  &.ant-btn-primary {
    background-color: #7c3aed !important;
    border-color: #7c3aed !important;
  }
  
  &.green {
    background-color: #10b981 !important;
    border-color: #10b981 !important;
    
    &:hover {
      background-color: #059669 !important;
      border-color: #059669 !important;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  height: 100vh !important;
`;

const BackButton = styled(Button)`
  display: flex !important;
  align-items: center !important;
`;

const QRCodeContainer = styled.div`
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 2rem !important;
  border: 2px dashed #e5e7eb !important;
  border-radius: 0.5rem !important;
  margin: 1.5rem 0 !important;
`;

const QRImage = styled.img`
  width: 250px !important;
  height: 250px !important;
  margin-bottom: 1rem !important;
`;

const PaymentInfoCard = styled(Card)`
  margin-bottom: 1.5rem !important;
  
  .ant-card-head {
    background-color: #f9fafb !important;
  }
`;

const TimerContainer = styled.div`
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 1rem 0 !important;
  
  .timer {
    font-size: 1.5rem !important;
    font-weight: bold !important;
    color: #ef4444 !important;
    margin-left: 0.5rem !important;
  }
`;

const StepsContainer = styled.div`
  margin: 2rem 0 !important;
  
  .ant-steps-item-process .ant-steps-item-icon {
    background-color: #7c3aed !important;
    border-color: #7c3aed !important;
  }
  
  .ant-steps-item-finish .ant-steps-item-icon {
    border-color: #7c3aed !important;
  }
  
  .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
    color: #7c3aed !important;
  }
  
  .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title::after {
    background-color: #7c3aed !important;
  }
`;

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  size: string;
  ice: string;
  toppings: string[];
  note: string;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  note: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'paid';
  createdAt: Date;
  table?: string;
  customer?: string;
}

interface PaymentInfo {
  orderId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  reference: string;
  qrCodeUrl: string;
  expiresIn: number; // in seconds
}

const StaffOrderPaymentScreen: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds
  const [paymentCompleted, setPaymentCompleted] = useState<boolean>(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  // Mock payment info - in a real app, this would come from your payment API
  const mockPaymentInfo: PaymentInfo = {
    orderId: 'ORD' + Math.floor(Math.random() * 10000),
    amount: 138000,
    bankName: 'Vietcombank',
    accountNumber: '1234567890',
    accountName: 'MILK TEA SHOP',
    reference: 'MT' + Math.floor(Math.random() * 1000000),
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MILK%20TEA%20PAYMENT%20138000VND',
    expiresIn: 300 // 5 minutes
  };

  useEffect(() => {
    // In a real app, you would get the order data from location.state or fetch it from API
    // For this example, we'll simulate loading the data
    const timer = setTimeout(() => {
      setPaymentInfo(mockPaymentInfo);
      setTimeLeft(mockPaymentInfo.expiresIn);
      setOrder({
        id: mockPaymentInfo.orderId,
        items: [
          {
            id: 1,
            productId: 1,
            productName: 'Trà sữa truyền thống',
            quantity: 2,
            size: 'M',
            ice: '70%',
            toppings: ['Trân châu đen', 'Pudding'],
            note: 'Ít đường',
            unitPrice: 35000,
            totalPrice: 96000
          },
          {
            id: 2,
            productId: 3,
            productName: 'Trà đào',
            quantity: 1,
            size: 'L',
            ice: '100%',
            toppings: ['Thạch trái cây'],
            note: '',
            unitPrice: 30000,
            totalPrice: 42000
          }
        ],
        totalAmount: 138000,
        note: '',
        status: 'confirmed',
        createdAt: new Date(),
        table: 'Bàn 01'
      });
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Countdown timer
    if (timeLeft > 0 && !paymentCompleted) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && !paymentCompleted) {
      message.error('Thời gian thanh toán đã hết. Vui lòng thử lại.');
    }
  }, [timeLeft, paymentCompleted]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handlePaymentConfirmation = () => {
    setLoading(true);
    
    // Simulate payment verification
    setTimeout(() => {
      setPaymentCompleted(true);
      setCurrentStep(2);
      setLoading(false);
      message.success('Thanh toán thành công!');
    }, 1500);
  };

  const handleBackToCart = () => {
    navigate('/staff/cart');
  };

  const handleCompleteOrder = () => {
    navigate('/staff/products');
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spin size="large" tip="Đang xử lý..." />
      </LoadingContainer>
    );
  }

  if (paymentCompleted) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <StyledHeader>
          <HeaderContent>
            <LogoSection>
              <IconContainer>
                <CreditCardOutlined />
              </IconContainer>
              <TitleContainer>
                <h1>Milk Tea Shop</h1>
                <p>
                  <span>Thanh toán</span>
                </p>
              </TitleContainer>
            </LogoSection>
          </HeaderContent>
        </StyledHeader>
        
        <ContentSection>
          <Result
            status="success"
            title="Thanh toán thành công!"
            subTitle={`Mã đơn hàng: ${order?.id}. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!`}
            extra={[
              <ActionButton 
                key="back" 
                onClick={handleBackToCart}
              >
                Quay lại giỏ hàng
              </ActionButton>,
              <ActionButton 
                key="complete" 
                type="primary" 
                onClick={handleCompleteOrder}
                className="green"
              >
                Hoàn tất đơn hàng
              </ActionButton>,
            ]}
          />
        </ContentSection>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <StyledHeader>
        <HeaderContent>
          <LogoSection>
            <IconContainer>
              <CreditCardOutlined />
            </IconContainer>
            <TitleContainer>
              <h1>Milk Tea Shop</h1>
              <p>
                <span>Thanh toán đơn hàng</span>
              </p>
            </TitleContainer>
          </LogoSection>
          <BackButton 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBackToCart}
            size="large"
          >
            Quay lại giỏ hàng
          </BackButton>
        </HeaderContent>
      </StyledHeader>
      
      <ContentSection>
        <StepsContainer>
          <Steps current={currentStep}>
            <Step title="Tạo đơn hàng" description="Đơn hàng đã được tạo" />
            <Step title="Thanh toán" description="Quét mã QR để thanh toán" />
            <Step title="Hoàn tất" description="Đơn hàng đã được thanh toán" />
          </Steps>
        </StepsContainer>
        
        <PaymentInfoCard
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <DollarOutlined style={{ marginRight: '8px', color: '#7c3aed' }} />
              <span>Thông tin thanh toán</span>
            </div>
          }
        >
          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Mã đơn hàng">
              <Tag color="blue">{paymentInfo?.orderId}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              <Text strong style={{ color: '#ef4444' }}>
                {formatCurrency(paymentInfo?.amount || 0)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngân hàng">{paymentInfo?.bankName}</Descriptions.Item>
            <Descriptions.Item label="Số tài khoản">{paymentInfo?.accountNumber}</Descriptions.Item>
            <Descriptions.Item label="Tên tài khoản">{paymentInfo?.accountName}</Descriptions.Item>
            <Descriptions.Item label="Nội dung chuyển khoản">
              <Text copyable strong>{paymentInfo?.reference}</Text>
            </Descriptions.Item>
          </Descriptions>
          
          <TimerContainer>
            <ClockCircleOutlined style={{ color: '#ef4444' }} />
            <span className="timer">{formatTime(timeLeft)}</span>
          </TimerContainer>
        </PaymentInfoCard>
        
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <QrcodeOutlined style={{ marginRight: '8px', color: '#7c3aed' }} />
                  <span>Quét mã QR để thanh toán</span>
                </div>
              }
            >
              <QRCodeContainer>
                <QRImage src={paymentInfo?.qrCodeUrl} alt="QR Code" />
                <Text type="secondary">Sử dụng ứng dụng ngân hàng để quét mã QR</Text>
              </QRCodeContainer>
              
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <ActionButton 
                  type="primary" 
                  icon={<CheckCircleOutlined />}
                  onClick={handlePaymentConfirmation}
                  className="green"
                  size="large"
                >
                  Xác nhận đã thanh toán
                </ActionButton>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ShoppingCartOutlined style={{ marginRight: '8px', color: '#7c3aed' }} />
                  <span>Chi tiết đơn hàng</span>
                </div>
              }
            >
              {order?.items.map((item, index) => (
                <div key={index} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: index < order.items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>{item.productName} x{item.quantity}</Text>
                    <Text>{formatCurrency(item.totalPrice)}</Text>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {item.size}, Đá: {item.ice}
                    {item.toppings.length > 0 && `, Topping: ${item.toppings.join(', ')}`}
                    {item.note && `, Ghi chú: ${item.note}`}
                  </div>
                </div>
              ))}
              
              <Divider style={{ margin: '0.5rem 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <Text strong>Tổng cộng:</Text>
                <Text strong style={{ fontSize: '1.125rem', color: '#ef4444' }}>
                  {formatCurrency(order?.totalAmount || 0)}
                </Text>
              </div>
              
              {order?.note && (
                <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem' }}>
                  <Text type="secondary">Ghi chú: {order.note}</Text>
                </div>
              )}
              
              {order?.table && (
                <div style={{ marginTop: '0.5rem' }}>
                  <Tag color="green">{order.table}</Tag>
                </div>
              )}
            </Card>
          </Col>
        </Row>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
          <BackButton 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBackToCart}
          >
            Quay lại giỏ hàng
          </BackButton>
          
          <ActionButton 
            type="primary" 
            icon={<CheckCircleOutlined />}
            onClick={handlePaymentConfirmation}
            className="green"
          >
            Xác nhận đã thanh toán
          </ActionButton>
        </div>
      </ContentSection>
    </div>
  );
};

export default StaffOrderPaymentScreen;