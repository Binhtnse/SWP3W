/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Table, Tag, Typography, Spin, Button, Modal, Descriptions, Layout } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import ManagerLayout from '../components/ManagerLayout';

const { Title } = Typography;
const { Content } = Layout;

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
  staff: string;
}

const mockOrders: Order[] = [
  {
    id: 'ORD1001',
    items: [
      {
        id: 1,
        productId: 1,
        productName: 'Trà sữa truyền thống',
        quantity: 2,
        size: 'M',
        ice: '70%',
        toppings: ['Trân châu đen'],
        note: 'Ít đường',
        unitPrice: 35000,
        totalPrice: 80000,
      }
    ],
    totalAmount: 80000,
    note: '',
    status: 'confirmed',
    createdAt: new Date(),
    staff: 'Nguyễn Văn B'
  },
  {
    id: 'ORD1002',
    items: [
      {
        id: 2,
        productId: 2,
        productName: 'Matcha đá xay',
        quantity: 1,
        size: 'L',
        ice: '50%',
        toppings: ['Kem phô mai'],
        note: '',
        unitPrice: 45000,
        totalPrice: 50000,
      }
    ],
    totalAmount: 50000,
    note: 'Mang đi',
    status: 'paid',
    createdAt: new Date(),
    staff: 'Trần Thị C'
  },
  {
    id: 'ORD1003',
    items: [
      {
        id: 3,
        productId: 3,
        productName: 'Trà đào',
        quantity: 2,
        size: 'M',
        ice: '100%',
        toppings: [],
        note: '',
        unitPrice: 30000,
        totalPrice: 60000,
      }
    ],
    totalAmount: 60000,
    note: '',
    status: 'completed',
    createdAt: new Date(),
    staff: 'Lê Quốc D'
  },
  {
    id: 'ORD1004',
    items: [
      {
        id: 4,
        productId: 4,
        productName: 'Cà phê sữa đá',
        quantity: 1,
        size: 'M',
        ice: '100%',
        toppings: [],
        note: 'Không đường',
        unitPrice: 25000,
        totalPrice: 25000,
      }
    ],
    totalAmount: 25000,
    note: 'Phục vụ tại chỗ',
    status: 'pending',
    createdAt: new Date(),
    staff: 'Ngô Minh E'
  }
];

const ManagerOrderListScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'staff',
      key: 'staff',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = {
          pending: 'orange',
          confirmed: 'blue',
          completed: 'green',
          cancelled: 'red',
          paid: 'purple'
        }[status];
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => formatDate(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Order) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedOrder(record);
            setIsModalVisible(true);
          }}
        >
          Xem chi tiết
        </Button>
      )
    }
  ];

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setIsModalVisible(false);
  };

  if (loading) {
    return <Spin tip="Đang tải danh sách đơn hàng..." style={{ marginTop: 100 }} />;
  }

  return (
    <ManagerLayout>
      <div style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '1.5rem' }}>
          <StyledHeader>
            <StyledTitle level={2}>Danh sách đơn hàng</StyledTitle>
          </StyledHeader>
          <Table
            dataSource={orders}
            columns={columns}
            rowKey="id"
            bordered
            pagination={{ pageSize: 5 }}
          />
        </Content>

        {/* Order Detail Modal */}
        <Modal
          title="Chi tiết đơn hàng"
          visible={isModalVisible}
          onCancel={handleCloseModal}
          footer={null}
          width={800}
        >
          {selectedOrder && (
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Mã đơn">{selectedOrder.id}</Descriptions.Item>
              <Descriptions.Item label="Người thực hiện">{selectedOrder.staff}</Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">{formatCurrency(selectedOrder.totalAmount)}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color="blue">{selectedOrder.status.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian">{formatDate(selectedOrder.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú">{selectedOrder.note || 'Không có'}</Descriptions.Item>
              <Descriptions.Item label="Sản phẩm">
                {selectedOrder.items.map((item) => (
                  <div key={item.id}>
                    <strong>{item.productName}</strong>
                    <p>Size: {item.size}, Số lượng: {item.quantity}, Giá: {formatCurrency(item.unitPrice)}</p>
                    <p>Ghi chú: {item.note}</p>
                    <p>Topping: {item.toppings.join(', ')}</p>
                  </div>
                ))}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </ManagerLayout>
  );
};

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const StyledTitle = styled(Title)`
  && {
    margin-bottom: 0 !important;
  }
`;

export default ManagerOrderListScreen;
