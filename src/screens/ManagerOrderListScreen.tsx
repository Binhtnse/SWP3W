/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Table, Tag, Typography, Spin, Button, Modal, Descriptions, Layout, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import axios from 'axios';
import ManagerLayout from '../components/ManagerLayout';

const { Title } = Typography;
const { Content } = Layout;

interface Order {
  id: string;
  totalPrice: number;
  status: string;
  createAt: string;
  updateAt: string;
  userName: string;
}

const ManagerOrderListScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1); // for pagination
  const [totalPages, setTotalPages] = useState(1); // to track the total number of pages

  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      message.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  };

  const fetchOrders = async (page: number) => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      if (!headers) return;

      const response = await axios.get('https://beautiful-unity-production.up.railway.app/api/v2/orders/all', {
        params: { page },
        headers,
      });

      const ordersData = response.data.data || [];
      setOrders(ordersData);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error('Không thể tải danh sách đơn hàng');
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (date: string) => {
    console.log("Original Date:", date); // Log the raw date for debugging

    // Split the date string into components (DD, MM, YYYY, HH:MM:SS)
    const [day, month, yearTime] = date.split('/');
    if (!yearTime) return 'Invalid Date'; // Handle case where the format is not as expected

    const [year, time] = yearTime.split(' ');
    if (!time) return 'Invalid Date'; // Ensure time exists before proceeding

    // Reformat the date into a valid ISO format (YYYY-MM-DDTHH:MM:SS)
    const isoDate = `${year}-${month}-${day}T${time}:00`;

    const formattedDate = new Date(isoDate);
    
    if (isNaN(formattedDate.getTime())) {
      console.error("Invalid date format:", isoDate); // Log the invalid ISO date format
      return 'Invalid Date';
    }

    // Return the formatted date using Intl.DateTimeFormat
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(formattedDate);
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = {
          PENDING: 'orange',
          PAID: 'green',
        }[status] || 'default';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'createAt',
      key: 'createAt',
      render: (date: string) => formatDate(date),
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
      ),
    },
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
            pagination={{
              pageSize: 5,
              current: page,
              total: totalPages * 5, // Assuming 5 items per page
              onChange: (newPage) => setPage(newPage),
            }}
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
              <Descriptions.Item label="Người thực hiện">{selectedOrder.userName}</Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">{formatCurrency(selectedOrder.totalPrice)}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color="blue">{selectedOrder.status.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian tạo">{formatDate(selectedOrder.createAt)}</Descriptions.Item>
              <Descriptions.Item label="Thời gian cập nhật">{formatDate(selectedOrder.updateAt)}</Descriptions.Item>
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
