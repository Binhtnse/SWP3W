import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Typography, 
  Divider, 
  Table, 
  Space, 
  Modal, 
  Input, 
  InputNumber, 
  message, 
  Spin,
  Tag,
  Row,
  Col
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CheckOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  MinusOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { TextArea } = Input;
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

const OrderIdTag = styled(Tag)`
  font-size: 1rem !important;
  padding: 0.5rem 0.75rem !important;
`;

const ContentSection = styled(Card)`
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  margin-bottom: 1.5rem !important;
`;

const ActionButton = styled(Button)`
  height: 3rem !important;
  font-size: 1rem !important;
  width: 100% !important;
`;

const GreenButton = styled(ActionButton)`
  background-color: #10b981 !important;
  border-color: #10b981 !important;
  
  &:hover {
    background-color: #059669 !important;
    border-color: #059669 !important;
  }
`;

const ProductInfo = styled.div`
  .product-name {
    font-weight: 600;
  }
  
  .product-details {
    font-size: 0.875rem;
    color: #6b7280;
  }
`;

const PriceText = styled.div`
  text-align: right;
  
  &.total {
    font-weight: 600;
  }
`;

const QuantityText = styled.div`
  text-align: center;
`;

const TotalSection = styled.div`
  display: flex;
  justify-content: flex-end;
  
  .total-label {
    font-size: 1.125rem;
  }
  
  .total-amount {
    font-size: 1.5rem;
    font-weight: 700;
    margin-left: 1rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const NotFoundContainer = styled.div`
  padding: 1.5rem;
  text-align: center;
  
  .back-button {
    margin-top: 1rem;
    background-color: #3b82f6;
  }
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.25rem;
  
  .ant-input-number {
    margin: 0 0.5rem;
    width: 4rem;
    text-align: center;
  }
`;

const ModalRow = styled.div`
  margin-bottom: 1rem;
  
  &.price-row {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
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
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
}

// Mock data for the order
const mockOrder: Order = {
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
      totalPrice: 96000 // 35000 + 5000 (trân châu) + 8000 (pudding) = 48000 * 2 = 96000
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
      totalPrice: 42000 // 30000 + 5000 (size L) + 7000 (thạch) = 42000
    }
  ],
  totalAmount: 138000, // 96000 + 42000
  note: '',
  status: 'pending',
  createdAt: new Date()
};

const StaffOrderConfirmScreen: React.FC = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderNote, setOrderNote] = useState<string>('');
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);

  useEffect(() => {
    // Simulate loading order data
    const timer = setTimeout(() => {
      setOrder(mockOrder);
      setOrderNote(mockOrder.note);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleEditItem = (item: OrderItem) => {
    setEditingItem({...item});
    setIsEditModalVisible(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem || !order) return;
    
    // Update the item in the order
    const updatedItems = order.items.map(item => 
      item.id === editingItem.id ? editingItem : item
    );
    
    // Recalculate total amount
    const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    setOrder({
      ...order,
      items: updatedItems,
      totalAmount: newTotalAmount
    });
    
    setIsEditModalVisible(false);
    setEditingItem(null);
    message.success('Đã cập nhật sản phẩm');
  };

  const handleRemoveItem = (itemId: number) => {
    confirm({
      title: 'Xác nhận xóa sản phẩm',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi đơn hàng?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        if (!order) return;
        
        const updatedItems = order.items.filter(item => item.id !== itemId);
        
        if (updatedItems.length === 0) {
          // If no items left, navigate back to products
          message.info('Đơn hàng trống. Quay lại danh sách sản phẩm.');
          navigate('/staff/products');
          return;
        }
        
        // Recalculate total amount
        const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        
        setOrder({
          ...order,
          items: updatedItems,
          totalAmount: newTotalAmount
        });
        
        message.success('Đã xóa sản phẩm khỏi đơn hàng');
      }
    });
  };

  const handleQuantityChange = (value: number | null) => {
    if (!editingItem || value === null) return;
    
    // Calculate new total price based on unit price and quantity
    const newTotalPrice = (editingItem.unitPrice * value);
    
    setEditingItem({
      ...editingItem,
      quantity: value,
      totalPrice: newTotalPrice
    });
  };

  const handleAddMoreProducts = () => {
    // Navigate to products screen to add more items
    navigate('/staff/products');
  };

  const handleCancelOrder = () => {
    confirm({
      title: 'Xác nhận hủy đơn hàng',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      okText: 'Hủy đơn hàng',
      okType: 'danger',
      cancelText: 'Quay lại',
      onOk() {
        message.success('Đã hủy đơn hàng');
        navigate('/staff/products');
      }
    });
  };

  const handleConfirmOrder = () => {
    if (!order) return;
    
    // Update order with note
    const updatedOrder = {
      ...order,
      note: orderNote,
      status: 'confirmed' as const
    };
    
    // Here you would typically send the order to the backend
    console.log('Confirmed order:', updatedOrder);
    
    message.success('Đơn hàng đã được xác nhận thành công!');
    
    // Navigate to order success or orders list
    setTimeout(() => {
      navigate('/staff/orders');
    }, 1500);
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record: OrderItem) => (
        <ProductInfo>
          <div className="product-name">{text}</div>
          <div className="product-details">
            <div>Kích cỡ: {record.size}</div>
            <div>Đá: {record.ice}</div>
            {record.toppings.length > 0 && (
              <div>
                Topping: {record.toppings.join(', ')}
              </div>
            )}
            {record.note && (
              <div>
                Ghi chú: {record.note}
              </div>
            )}
          </div>
        </ProductInfo>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity: number) => (
        <QuantityText>{quantity}</QuantityText>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 150,
      render: (price: number) => (
        <PriceText>{formatCurrency(price)}</PriceText>
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 150,
      render: (price: number) => (
        <PriceText className="total">{formatCurrency(price)}</PriceText>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_: unknown, record: OrderItem) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditItem(record)}
            style={{ color: '#3b82f6' }}
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            onClick={() => handleRemoveItem(record.id)}
            style={{ color: '#ef4444' }}
          />
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

  if (!order) {
    return (
      <NotFoundContainer>
        <Title level={3}>Không tìm thấy đơn hàng</Title>
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/staff/products')}
          className="back-button"
        >
          Quay lại danh sách sản phẩm
        </Button>
      </NotFoundContainer>
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
                <span>Xác nhận đơn hàng</span>
              </p>
            </TitleContainer>
          </LogoSection>
          <OrderIdTag color="blue">
            Mã đơn: {order.id}
          </OrderIdTag>
        </HeaderContent>
      </StyledHeader>
      
      <ContentSection>
        <Title level={4}>Chi tiết đơn hàng</Title>
        <Table 
          dataSource={order.items} 
          columns={columns} 
          pagination={false}
          rowKey="id"
          style={{ marginBottom: '1rem' }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="dashed" 
            icon={<PlusOutlined />} 
            onClick={handleAddMoreProducts}
            style={{ marginBottom: '1rem' }}
          >
            Thêm sản phẩm
          </Button>
        </div>
        
        <Divider />
        
        <div style={{ marginBottom: '1rem' }}>
          <Title level={5}>Ghi chú đơn hàng:</Title>
          <TextArea 
            rows={2} 
            placeholder="Nhập ghi chú cho đơn hàng (nếu có)..."
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        
        <TotalSection>
          <Text className="total-label">Tổng tiền:</Text>
          <Text className="total-amount">{formatCurrency(order.totalAmount)}</Text>
        </TotalSection>
      </ContentSection>
      
      <Row gutter={16} style={{ marginTop: '1.5rem' }}>
        <Col span={8}>
          <ActionButton 
            danger
            icon={<DeleteOutlined />}
            onClick={handleCancelOrder}
          >
            Hủy đơn hàng
          </ActionButton>
        </Col>
        <Col span={8}>
          <ActionButton 
            icon={<EditOutlined />}
            onClick={handleAddMoreProducts}
          >
            Chỉnh sửa đơn hàng
          </ActionButton>
        </Col>
        <Col span={8}>
          <GreenButton 
            type="primary" 
            icon={<CheckOutlined />}
            onClick={handleConfirmOrder}
          >
            Xác nhận đơn hàng
          </GreenButton>
        </Col>
      </Row>
      
      {/* Edit Item Modal */}
      <Modal
        title="Chỉnh sửa sản phẩm"
        open={isEditModalVisible}
        onOk={handleUpdateItem}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        {editingItem && (
          <div>
            <ModalRow>
              <Text strong>{editingItem.productName}</Text>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                <div>Kích cỡ: {editingItem.size}</div>
                <div>Đá: {editingItem.ice}</div>
                {editingItem.toppings.length > 0 && (
                  <div>
                    Topping: {editingItem.toppings.join(', ')}
                  </div>
                )}
              </div>
            </ModalRow>
            
            <ModalRow>
              <Text>Ghi chú:</Text>
              <TextArea 
                rows={2}
                value={editingItem.note}
                onChange={(e) => setEditingItem({...editingItem, note: e.target.value})}
                placeholder="Nhập ghi chú cho sản phẩm..."
                style={{ width: '100%', marginTop: '0.25rem' }}
              />
            </ModalRow>
            
            <ModalRow>
              <Text>Số lượng:</Text>
              <QuantityControl>
                <Button 
                  icon={<MinusOutlined />} 
                  onClick={() => handleQuantityChange(Math.max(1, editingItem.quantity - 1))}
                  disabled={editingItem.quantity <= 1}
                />
                <InputNumber
                  min={1}
                  value={editingItem.quantity}
                  onChange={handleQuantityChange}
                />
                <Button 
                  icon={<PlusOutlined />} 
                  onClick={() => handleQuantityChange(editingItem.quantity + 1)}
                />
              </QuantityControl>
            </ModalRow>
            
            <ModalRow className="price-row">
              <Text>Đơn giá:</Text>
              <Text>{formatCurrency(editingItem.unitPrice)}</Text>
            </ModalRow>
            <ModalRow className="price-row">
              <Text strong>Thành tiền:</Text>
              <Text strong>{formatCurrency(editingItem.totalPrice)}</Text>
            </ModalRow>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffOrderConfirmScreen;
