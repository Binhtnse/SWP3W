import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Divider, Table, Space, Modal, message, Spin, Tag, Empty } from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined, DeleteOutlined, ExclamationCircleOutlined, CheckCircleOutlined, CreditCardOutlined } from '@ant-design/icons';
import { StyledHeader, HeaderContent, LogoSection, IconContainer, TitleContainer, ContentSection, ActionButton, OrderSummary, SummaryInfo, SummaryActions, LoadingContainer, BackButton } from '../components/styled components/StaffCartStyles';
import axios from 'axios';

const { Text } = Typography;
const { confirm } = Modal;

interface OrderItemChild {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  size: string | null;
  note: string | null;
  childItems: OrderItemChild[];
  combo: boolean;
}

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  size: string | null;
  note: string | null;
  childItems: OrderItemChild[];
  combo: boolean;
}

interface Order {
  id: number;
  totalPrice: number;
  status: string;
  createAt: string;
  updateAt: string | null;
  deleteAt: string | null;
  userId: number;
  userName: string;
  items?: OrderItem[];
}

interface ApiResponse {
  data: Order[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

const StaffCartScreen: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthAxios = () => {
    const accessToken = localStorage.getItem("accessToken");
    return axios.create({
      baseURL: "https://beautiful-unity-production.up.railway.app",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        
        if (!userId) {
          message.error("Không tìm thấy thông tin người dùng, vui lòng đăng nhập lại");
          navigate("/");
          return;
        }

        const authAxios = getAuthAxios();
        const response = await authAxios.get<ApiResponse>(
          "/api/orders?page=0&size=20&status=PENDING"
        );

        // Filter orders to only show those created by the current user
        const userOrders = response.data.data.filter(
          (order) => order.userId.toString() === userId
        );

        // Fetch order details for each order
        const ordersWithDetails = await Promise.all(
          userOrders.map(async (order) => {
            try {
              const detailsResponse = await authAxios.get<OrderItem[]>(`/api/orders/${order.id}/details`);
              return {
                ...order,
                items: detailsResponse.data
              };
            } catch (error) {
              console.error(`Error fetching details for order ${order.id}:`, error);
              return order;
            }
          })
        );

        setOrders(ordersWithDetails);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userRole");
          localStorage.removeItem("userId");
          navigate("/");
        } else {
          setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
        }
        
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    // The date format from API is "28/04/2025 01:59:52"
    return dateString;
  };

  // Helper function to render order items recursively
  const renderOrderItems = (items: OrderItemChild[], level = 0): React.ReactNode => {
    return items.map((item, index) => (
      <div key={`${item.id}-${index}`} className={index > 0 ? 'mt-2 pt-2 border-t border-gray-200' : ''}>
        <div className={`font-medium ${level > 0 ? 'ml-4' : ''}`} style={{ paddingLeft: level * 12 }}>
          {level > 0 && <Tag color="purple" style={{ marginRight: 8 }}>Topping</Tag>}
          {item.combo && <Tag color="blue" style={{ marginRight: 8 }}>Combo</Tag>}
          {item.productName} x{item.quantity}
        </div>
        <div className={`text-sm text-gray-500 ${level > 0 ? 'ml-4' : ''}`} style={{ paddingLeft: level * 12 }}>
          {item.size && `Size: ${item.size}`}
          {item.unitPrice && `, Đơn giá: ${formatCurrency(item.unitPrice)}`}
          {item.note && `, Ghi chú: ${item.note}`}
        </div>
        {item.childItems && item.childItems.length > 0 && (
          <div className="mt-1">
            {renderOrderItems(item.childItems, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const handleCancelOrder = (orderId: number) => {
    confirm({
      title: 'Xác nhận hủy đơn hàng',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      okText: 'Hủy đơn hàng',
      okType: 'danger',
      cancelText: 'Quay lại',
      onOk: async () => {
        try {
          const authAxios = getAuthAxios();
          await authAxios.put(`/api/orders/${orderId}/cancel`);
          
          const updatedOrders = orders.filter(order => order.id !== orderId);
          setOrders(updatedOrders);
          message.success('Đã hủy đơn hàng');
        } catch (error) {
          console.error("Error cancelling order:", error);
          message.error('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
        }
      }
    });
  };

  const handleCancelAllOrders = () => {
    if (orders.length === 0) {
      message.warning('Không có đơn hàng nào để hủy');
      return;
    }

    confirm({
      title: 'Xác nhận hủy tất cả đơn hàng',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn hủy tất cả đơn hàng trong giỏ hàng?',
      okText: 'Hủy tất cả',
      okType: 'danger',
      cancelText: 'Quay lại',
      onOk: async () => {
        try {
          const authAxios = getAuthAxios();
          
          // Cancel all orders in parallel
          await Promise.all(
            orders.map(order => 
              authAxios.put(`/api/orders/${order.id}/cancel`)
            )
          );
          
          setOrders([]);
          message.success('Đã hủy tất cả đơn hàng');
        } catch (error) {
          console.error("Error cancelling all orders:", error);
          message.error('Không thể hủy tất cả đơn hàng. Vui lòng thử lại sau.');
        }
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
      onOk: async () => {
        try {
          const authAxios = getAuthAxios();
          
          // Process payment for all orders in parallel
          await Promise.all(
            orders.map(order => 
              authAxios.put(`/api/orders/${order.id}/pay`)
            )
          );
          
          setOrders([]);
          message.success('Thanh toán tất cả đơn hàng thành công!');
        } catch (error) {
          console.error("Error paying for all orders:", error);
          message.error('Không thể thanh toán. Vui lòng thử lại sau.');
        }
      }
    });
  };

  const calculateTotalAmount = () => {
    return orders.reduce((sum, order) => sum + order.totalPrice, 0);
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => (
        <Tag color="blue" className="text-base px-3 py-1">
          #{id}
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
            Khách hàng: {record.userName || 'Khách lẻ'}
          </div>
          <div className="text-sm text-gray-500">
            Thời gian: {formatDate(record.createAt)}
          </div>
        </div>
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'items',
      key: 'items',
      render: (items: OrderItem[] | undefined) => (
        <div>
          {items && items.length > 0 ? (
            renderOrderItems(items)
          ) : (
            <Text type="secondary">Đang tải chi tiết...</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
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

  if (error) {
    return (
      <LoadingContainer>
        <div className="text-center">
          <Text type="danger" style={{ fontSize: '16px' }}>{error}</Text>
          <Button 
            type="primary" 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '16px' }}
          >
            Thử lại
          </Button>
        </div>
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
                  disabled={orders.length === 0}
                >
                  Hủy tất cả
                </Button>
                <ActionButton 
                  type="primary" 
                  icon={<CreditCardOutlined />}
                  onClick={handlePayAllOrders}
                  className="green"
                  disabled={orders.length === 0}
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
