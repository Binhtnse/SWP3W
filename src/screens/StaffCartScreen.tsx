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
  Popconfirm
} from 'antd';
import { 
  ArrowLeftOutlined, 
  ShoppingCartOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import styled from 'styled-components';

const { Text } = Typography;
const { confirm } = Modal;

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

const OrderSummary = styled.div`
  display: flex !important;
  flex-direction: column !important;
  
  @media (min-width: 768px) {
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
`;

const SummaryInfo = styled.div`
  display: flex !important;
  align-items: center !important;
  margin-bottom: 1rem !important;
  
  @media (min-width: 768px) {
    margin-bottom: 0 !important;
  }
`;

const SummaryActions = styled.div`
  display: flex !important;
  justify-content: flex-end !important;
  gap: 0.5rem !important;
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
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

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
        setSelectedOrderIds(selectedOrderIds.filter(id => id !== orderId));
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
        setSelectedOrderIds([]);
        message.success('Đã hủy tất cả đơn hàng');
      }
    });
  };

  const handlePayOrder = (orderId: string) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: 'paid' as const } : order
    );
    
    setOrders(updatedOrders);
    setSelectedOrderIds(selectedOrderIds.filter(id => id !== orderId));
    message.success('Thanh toán đơn hàng thành công!');
  };

  const handlePaySelectedOrders = () => {
    if (selectedOrderIds.length === 0) {
      message.warning('Vui lòng chọn ít nhất một đơn hàng để thanh toán');
      return;
    }

    confirm({
      title: 'Xác nhận thanh toán',
      icon: <CheckCircleOutlined style={{ color: 'green' }} />,
      content: `Bạn có chắc chắn muốn thanh toán ${selectedOrderIds.length} đơn hàng đã chọn?`,
      okText: 'Thanh toán',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk() {
        const updatedOrders = orders.map(order => 
          selectedOrderIds.includes(order.id) 
            ? { ...order, status: 'paid' as const } 
            : order
        );
        
        setOrders(updatedOrders.filter(order => order.status !== 'paid'));
        setSelectedOrderIds([]);
        message.success('Thanh toán thành công!');
      }
    });
  };

//   const handleSelectOrder = (orderId: string, selected: boolean) => {
//     if (selected) {
//       setSelectedOrderIds([...selectedOrderIds, orderId]);
//     } else {
//       setSelectedOrderIds(selectedOrderIds.filter(id => id !== orderId));
//     }
//   };

//   const handleSelectAllOrders = (selected: boolean) => {
//     if (selected) {
//       setSelectedOrderIds(orders.map(order => order.id));
//     } else {
//       setSelectedOrderIds([]);
//     }
//   };

  const calculateTotalAmount = () => {
    return orders
      .filter(order => selectedOrderIds.includes(order.id))
      .reduce((sum, order) => sum + order.totalAmount, 0);
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
          <Popconfirm
            title="Xác nhận thanh toán đơn hàng này?"
            onConfirm={() => handlePayOrder(record.id)}
            okText="Thanh toán"
            cancelText="Hủy"
          >
            <Button 
              type="primary" 
              icon={<CreditCardOutlined />} 
              className="bg-green-500 hover:bg-green-600"
            >
              Thanh toán
            </Button>
          </Popconfirm>
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

  const rowSelection = {
    selectedRowKeys: selectedOrderIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedOrderIds(selectedRowKeys as string[]);
    }
  };

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
              rowSelection={rowSelection}
              dataSource={orders} 
              columns={columns} 
              pagination={false}
              rowKey="id"
              style={{ marginBottom: '1rem' }}
            />
            
            <Divider />
            
            <OrderSummary>
              <SummaryInfo>
                <Text style={{ marginRight: '0.5rem' }}>Đã chọn:</Text>
                <Text strong>{selectedOrderIds.length}</Text>
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
                  onClick={handlePaySelectedOrders}
                  className="green"
                  disabled={selectedOrderIds.length === 0}
                >
                  Thanh toán đã chọn
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
