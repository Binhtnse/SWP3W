import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Typography, 
  Divider, 
  Table, 
  Space, 
  Modal, 
  message, 
  Spin,
  Tag,
  Empty,
} from 'antd';
import { 
  ArrowLeftOutlined, 
  ShoppingCartOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { StyledHeader, HeaderContent, LogoSection, IconContainer, TitleContainer, ContentSection, ActionButton, OrderSummary, SummaryInfo, SummaryActions, LoadingContainer, BackButton } from '../components/styled components/StaffCartStyles';

const { Text } = Typography;
const { confirm } = Modal;

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

// Mock data for confirmed orders
const mockOrders: Order[] = [
  {
    id: 'ORD' + Math.floor(Math.random() * 10000),
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
  },
  {
    id: 'ORD' + Math.floor(Math.random() * 10000),
    items: [
      {
        id: 3,
        productId: 2,
        productName: 'Matcha đá xay',
        quantity: 1,
        size: 'L',
        ice: '50%',
        toppings: ['Kem phô mai'],
        note: 'Ít đá',
        unitPrice: 45000,
        totalPrice: 55000
      }
    ],
    totalAmount: 55000,
    note: 'Khách mang đi',
    status: 'confirmed',
    createdAt: new Date(),
    customer: 'Nguyễn Văn A'
  }
];

const StaffCartScreen: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate loading order data
    const timer = setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleCancelOrder = (orderId: string) => {
    confirm({
      title: 'Xác nhận hủy đơn hàng',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      okText: 'Hủy đơn hàng',
      okType: 'danger',
      cancelText: 'Quay lại',
      onOk() {
        const updatedOrders = orders.filter(order => order.id !== orderId);
        setOrders(updatedOrders);
        message.success('Đã hủy đơn hàng');
      }
    });
  };

  const handleCancelAllOrders = () => {
    confirm({
      title: 'Xác nhận hủy tất cả đơn hàng',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn hủy tất cả đơn hàng trong giỏ hàng?',
      okText: 'Hủy tất cả',
      okType: 'danger',
      cancelText: 'Quay lại',
      onOk() {
        setOrders([]);
        message.success('Đã hủy tất cả đơn hàng');
      }
    });
  };

  const handlePayAllOrders = () => {
    if (orders.length === 0) {
      message.warning('Không có đơn hàng nào để thanh toán');
      return;
    }

    confirm({
      title: 'Xác nhận thanh toán tất cả đơn hàng',
      icon: <CheckCircleOutlined style={{ color: 'green' }} />,
      content: `Bạn có chắc chắn muốn thanh toán tất cả ${orders.length} đơn hàng?`,
      okText: 'Thanh toán',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk() {
        setOrders([]);
        message.success('Thanh toán tất cả đơn hàng thành công!');
      }
    });
  };

  const calculateTotalAmount = () => {
    return orders.reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <Tag color="blue" className="text-base px-3 py-1">
          {id}
        </Tag>
      ),
    },
    {
      title: 'Thông tin',
      dataIndex: 'info',
      key: 'info',
      render: (_: unknown, record: Order) => (
        <div>
          <div className="font-semibold">
            {record.table ? `${record.table}` : record.customer ? `Khách hàng: ${record.customer}` : 'Khách lẻ'}
          </div>
          <div className="text-sm text-gray-500">
            Thời gian: {formatDate(record.createdAt)}
          </div>
          {record.note && (
            <div className="text-sm text-gray-500">
              Ghi chú: {record.note}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'items',
      key: 'items',
      render: (items: OrderItem[]) => (
        <div>
          {items.map((item, index) => (
            <div key={index} className={index > 0 ? 'mt-2 pt-2 border-t border-gray-200' : ''}>
              <div className="font-medium">{item.productName} x{item.quantity}</div>
              <div className="text-sm text-gray-500">
                {item.size}, Đá: {item.ice}
                {item.toppings.length > 0 && `, Topping: ${item.toppings.join(', ')}`}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => (
        <div className="text-right font-semibold">{formatCurrency(amount)}</div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: Order) => (
        <Space size="small">
          <Button 
            danger
            icon={<DeleteOutlined />} 
            onClick={() => handleCancelOrder(record.id)}
          >
            Hủy
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <LoadingContainer>
        <Spin size="large" tip="Đang tải..." />
      </LoadingContainer>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <StyledHeader>
        <HeaderContent>
          <LogoSection>
            <IconContainer>
              <ShoppingCartOutlined />
            </IconContainer>
            <TitleContainer>
              <h1>Milk Tea Shop</h1>
              <p>
                <span>Giỏ hàng</span>
              </p>
            </TitleContainer>
          </LogoSection>
          <BackButton 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/staff/products')}
            size="large"
          >
            Quay lại danh sách sản phẩm
          </BackButton>
        </HeaderContent>
      </StyledHeader>
      
      <ContentSection>
        {orders.length > 0 ? (
          <>
            <Table 
              dataSource={orders} 
              columns={columns} 
              pagination={false}
              rowKey="id"
              style={{ marginBottom: '1rem' }}
            />
            
            <Divider />
            
            <OrderSummary>
              <SummaryInfo>
                <Text style={{ marginRight: '0.5rem' }}>Tổng cộng:</Text>
                <Text strong>{orders.length}</Text>
                <Text style={{ margin: '0 0.5rem' }}>đơn hàng</Text>
                <Text strong style={{ marginLeft: '1rem', fontSize: '1.125rem' }}>
                  {formatCurrency(calculateTotalAmount())}
                </Text>
              </SummaryInfo>
              <SummaryActions>
                <Button 
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleCancelAllOrders}
                >
                  Hủy tất cả
                </Button>
                <ActionButton 
                  type="primary" 
                  icon={<CreditCardOutlined />}
                  onClick={handlePayAllOrders}
                  className="green"
                >
                  Thanh toán tất cả
                </ActionButton>
              </SummaryActions>
            </OrderSummary>
          </>
        ) : (
          <Empty
            description="Không có đơn hàng nào trong giỏ hàng"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <ActionButton 
              type="primary" 
              onClick={() => navigate('/staff/products')}
              style={{ marginTop: '1rem' }}
            >
              Tạo đơn hàng mới
            </ActionButton>
          </Empty>
        )}
      </ContentSection>
    </div>
  );
};

export default StaffCartScreen;
