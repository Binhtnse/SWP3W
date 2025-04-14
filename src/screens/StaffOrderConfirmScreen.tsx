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
  MinusOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
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
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-sm text-gray-500">
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
        </div>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity: number) => (
        <div className="text-center">{quantity}</div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 150,
      render: (price: number) => (
        <div className="text-right">{formatCurrency(price)}</div>
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 150,
      render: (price: number) => (
        <div className="text-right font-semibold">{formatCurrency(price)}</div>
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
            className="text-blue-500"
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            onClick={() => handleRemoveItem(record.id)}
            className="text-red-500"
          />
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <Title level={3}>Không tìm thấy đơn hàng</Title>
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/staff/products')}
          className="mt-4 bg-blue-500"
        >
          Quay lại danh sách sản phẩm
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/staff/products')}
        >
          Quay lại danh sách sản phẩm
        </Button>
        <Title level={3} className="m-0">Xác nhận đơn hàng</Title>
        <div>
          <Tag color="blue" className="text-base px-3 py-1">
            Mã đơn: {order.id}
          </Tag>
        </div>
      </div>
      
      <Card className="shadow-md mb-4">
        <Title level={4}>Chi tiết đơn hàng</Title>
        <Table 
          dataSource={order.items} 
          columns={columns} 
          pagination={false}
          rowKey="id"
          className="mb-4"
        />
        
        <div className="flex justify-end">
          <Button 
            type="dashed" 
            icon={<PlusOutlined />} 
            onClick={handleAddMoreProducts}
            className="mb-4"
          >
            Thêm sản phẩm
          </Button>
        </div>
        
        <Divider />
        
        <div className="mb-4">
          <Title level={5}>Ghi chú đơn hàng:</Title>
          <TextArea 
            rows={2} 
            placeholder="Nhập ghi chú cho đơn hàng (nếu có)..."
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex justify-end">
          <div className="text-right">
            <div className="mb-2">
              <Text className="text-lg">Tổng tiền:</Text>
              <Text className="text-2xl font-bold ml-4">{formatCurrency(order.totalAmount)}</Text>
            </div>
          </div>
        </div>
      </Card>
      
      <Row gutter={16} className="mt-6">
        <Col span={8}>
          <Button 
            danger
            icon={<DeleteOutlined />}
            onClick={handleCancelOrder}
            className="w-full h-12 text-base"
          >
            Hủy đơn hàng
          </Button>
        </Col>
        <Col span={8}>
          <Button 
            icon={<EditOutlined />}
            onClick={handleAddMoreProducts}
            className="w-full h-12 text-base"
          >
            Chỉnh sửa đơn hàng
          </Button>
        </Col>
        <Col span={8}>
          <Button 
            type="primary" 
            icon={<CheckOutlined />}
            onClick={handleConfirmOrder}
            className="w-full h-12 text-base bg-green-500 hover:bg-green-600"
          >
            Xác nhận đơn hàng
          </Button>
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
            <div className="mb-4">
              <Text strong>{editingItem.productName}</Text>
              <div className="text-sm text-gray-500">
                <div>Kích cỡ: {editingItem.size}</div>
                <div>Đá: {editingItem.ice}</div>
                {editingItem.toppings.length > 0 && (
                  <div>
                    Topping: {editingItem.toppings.join(', ')}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <Text>Ghi chú:</Text>
              <TextArea 
                rows={2}
                value={editingItem.note}
                onChange={(e) => setEditingItem({...editingItem, note: e.target.value})}
                placeholder="Nhập ghi chú cho sản phẩm..."
                className="w-full mt-1"
              />
            </div>
            
            <div className="mb-4">
              <Text>Số lượng:</Text>
              <div className="flex items-center mt-1">
                <Button 
                  icon={<MinusOutlined />} 
                  onClick={() => handleQuantityChange(Math.max(1, editingItem.quantity - 1))}
                  disabled={editingItem.quantity <= 1}
                />
                <InputNumber
                  min={1}
                  value={editingItem.quantity}
                  onChange={handleQuantityChange}
                  className="mx-2 w-16 text-center"
                />
                <Button 
                  icon={<PlusOutlined />} 
                  onClick={() => handleQuantityChange(editingItem.quantity + 1)}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between">
                <Text>Đơn giá:</Text>
                <Text>{formatCurrency(editingItem.unitPrice)}</Text>
              </div>
              <div className="flex justify-between mt-2">
                <Text strong>Thành tiền:</Text>
                <Text strong>{formatCurrency(editingItem.totalPrice)}</Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffOrderConfirmScreen;
