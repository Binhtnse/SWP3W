/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Typography, Spin, Button, Layout } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import ManagerSidebar from '../components/ManagerSidebar';

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
  const navigate = useNavigate();

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
          onClick={() => navigate(`/manager/orders/${record.id}`)}
        >
          Xem chi tiết
        </Button>
      )
    }
  ];

  if (loading) {
    return <Spin tip="Đang tải danh sách đơn hàng..." style={{ marginTop: 100 }} />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <ManagerSidebar />
      <Layout>
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
      </Layout>
    </Layout>
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