/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
  Table,
  Tag,
  Typography,
  Button,
  Modal,
  Descriptions,
  Layout,
  message,
  Input,
  Select,
  Space,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import axios from 'axios';
import ManagerLayout from '../components/ManagerLayout';

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

interface Order {
  id: number;
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
  const [orderDetails, setOrderDetails] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterUserName, setFilterUserName] = useState<string>('');

  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      message.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  };

  const fetchOrders = async (page: number, size: number) => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      if (!headers) return;

      const response = await axios.get('https://beautiful-unity-production.up.railway.app/api/orders', {
        params: {
          page: page - 1,
          size: size,
          status: filterStatus,
          staffName: filterUserName || undefined,
        },
        headers,
      });

      const ordersData = response.data.data || [];
      setOrders(ordersData);
      setTotalPages(response.data.totalPages);
      setLoading(false);
      console.log(loading)
    } catch (error) {
      setLoading(false);
      message.error('Không thể tải danh sách đơn hàng');
    }
  };

  useEffect(() => {
    fetchOrders(page, pageSize);
  }, [page, pageSize]);


  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchOrders(1, pageSize);
    }, 400);
    return () => clearTimeout(timeout);
  }, [filterStatus, filterUserName]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    try {
      const parts = date.split(/[/ :]/);
      if (parts.length >= 6) {
        const [day, month, year, hours, minutes, seconds] = parts;
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
        const dateObj = new Date(isoDate);
        if (!isNaN(dateObj.getTime())) {
          return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(dateObj);
        }
      }
      return date;
    } catch (error) {
      console.error("Error formatting date:", date, error);
      return 'Invalid Date';
    }
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => <Tag color="blue">{id}</Tag>,
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
          onClick={async () => {
            setSelectedOrder(record);
            setIsModalVisible(true);
            try {
              const headers = getAuthHeader();
              if (!headers) return;
              const res = await axios.get(`https://beautiful-unity-production.up.railway.app/api/orders/${record.id}/details`, { headers });
              setOrderDetails(res.data || []);
            } catch {
              message.error("Không thể tải chi tiết đơn hàng");
            }
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setOrderDetails([]);
    setIsModalVisible(false);
  };

  return (
    <ManagerLayout>
      <div style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '1.5rem' }}>
          <StyledHeader>
            <StyledTitle level={2}>Danh sách đơn hàng</StyledTitle>
          </StyledHeader>

          <Space style={{ marginBottom: 16 }} wrap>
            <Select
              placeholder="Chọn trạng thái"
              allowClear
              style={{ width: 180 }}
              value={filterStatus}
              onChange={(value) => setFilterStatus(value)}
            >
              <Option value="PENDING">PENDING</Option>
              <Option value="PAID">PAID</Option>
            </Select>

            <Input
              placeholder="Nhập tên người thực hiện"
              value={filterUserName}
              onChange={(e) => setFilterUserName(e.target.value)}
              style={{ width: 220 }}
            />
          </Space>

          <Table
            dataSource={orders}
            columns={columns}
            rowKey="id"
            bordered
            pagination={{
              current: page,
              pageSize: pageSize,
              total: totalPages * pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              onShowSizeChange: (current, size) => {
                setPageSize(size);
                setPage(1);
                console.log(current)
              },
              onChange: (newPage) => setPage(newPage),
            }}
          />
        </Content>

        <Modal
          title="Chi tiết đơn hàng"
          visible={isModalVisible}
          onCancel={handleCloseModal}
          footer={null}
          width={800}
        >
          {selectedOrder && (
            <>
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

              {orderDetails.length > 0 && (
                <>
                  <Typography.Title level={5} style={{ marginTop: 24 }}>Sản phẩm đã đặt</Typography.Title>
                  <Table
                    dataSource={orderDetails}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    columns={[
                      {
                        title: 'Sản phẩm',
                        dataIndex: 'productName',
                        key: 'productName',
                        render: (text, record) => (
                          <>
                            <strong>{text}</strong>
                            {record.childItems?.length > 0 && (
                              <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                                {record.childItems.map((child: any) => (
                                  <li key={child.id}>
                                    {child.productName} - Size: {child.size} - SL: {child.quantity} - Giá: {formatCurrency(child.unitPrice)}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </>
                        ),
                      },
                      {
                        title: 'Size',
                        dataIndex: 'size',
                        key: 'size',
                      },
                      {
                        title: 'Số lượng',
                        dataIndex: 'quantity',
                        key: 'quantity',
                      },
                      {
                        title: 'Đơn giá',
                        dataIndex: 'unitPrice',
                        key: 'unitPrice',
                        render: (price: number, record: any) => {
                          const extraPrice = record.childItems?.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0);
                          return (
                            <>
                              {formatCurrency(price)}
                              {extraPrice > 0 && ` + ${formatCurrency(extraPrice)} (Sản phẩm kèm theo)`}
                            </>
                          );
                        },
                      },
                      {
                        title: 'Tổng tiền',
                        key: 'total',
                        render: (_: any, record: any) => {
                          const price = record.unitPrice;
                          const quantity = record.quantity;


                          const extraPrice = record.childItems?.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0);
                          const totalPrice = (price * quantity) + (extraPrice || 0);
                          return formatCurrency(totalPrice);
                        },
                      },

                      {
                        title: 'Ghi chú',
                        dataIndex: 'note',
                        key: 'note',
                      },
                    ]}
                  />
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Tổng hóa đơn">
                      <strong>{formatCurrency(
                        orderDetails.reduce((total: number, item: any) => {

                          const itemTotal = (item.unitPrice * item.quantity) +
                            (item.childItems?.reduce((sum: number, child: any) => sum + (child.unitPrice * child.quantity), 0) || 0);
                          return total + itemTotal;
                        }, 0)
                      )}</strong>
                    </Descriptions.Item>
                  </Descriptions>

                </>
              )}
            </>
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
