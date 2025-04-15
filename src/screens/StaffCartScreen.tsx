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
  message, 
  Spin,
  Tag,
  Row,
  Col,
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

const { Title, Text } = Typography;
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
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải..." />
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
        <Title level={3} className="m-0">
          <ShoppingCartOutlined className="mr-2" />
          Giỏ hàng
        </Title>
        <div></div>
      </div>
      
      <Card className="shadow-md mb-4">
        {orders.length > 0 ? (
          <>
            <Table 
              rowSelection={rowSelection}
              dataSource={orders} 
              columns={columns} 
              pagination={false}
              rowKey="id"
              className="mb-4"
            />
            
            <Divider />
            
            <Row gutter={16} className="mt-6">
              <Col span={12}>
                <div className="flex items-center">
                  <Text className="mr-2">Đã chọn:</Text>
                  <Text strong>{selectedOrderIds.length}</Text>
                  <Text className="mx-2">đơn hàng</Text>
                  <Text strong className="ml-4 text-lg">
                    {formatCurrency(calculateTotalAmount())}
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="flex justify-end">
                  <Button 
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleCancelAllOrders}
                    className="mr-2"
                  >
                    Hủy tất cả
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<CreditCardOutlined />}
                    onClick={handlePaySelectedOrders}
                    className="bg-green-500 hover:bg-green-600"
                    disabled={selectedOrderIds.length === 0}
                  >
                    Thanh toán đã chọn
                  </Button>
                </div>
              </Col>
            </Row>
          </>
        ) : (
          <Empty
            description="Không có đơn hàng nào trong giỏ hàng"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button 
              type="primary" 
              onClick={() => navigate('/staff/products')}
              className="mt-4 bg-blue-500"
            >
              Tạo đơn hàng mới
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  );
};

export default StaffCartScreen;
