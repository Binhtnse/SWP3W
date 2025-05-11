import React, { useState, useEffect } from "react";
import {
  Spin,
  message,
  Typography,
  Pagination,
  Select,
  Table,
  Modal,
  Descriptions,
} from "antd";
import {
  ShoppingOutlined,
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "../hooks/useAuthState";
import {
  Container,
  Header,
  HeaderTitle,
  IconContainer,
  ContentCard,
  FilterSection,
  PaginationContainer,
  StyledButton,
  StyledInput,
  StyledSelect,
  StatusTag,
  LoadingContainer,
  ActionButtonsContainer,
} from "../components/styled components/StaffProccessingOrderStyles";

const { Title, Text } = Typography;
const { Option } = Select;

interface Order {
  id: number;
  totalPrice: number;
  status: string;
  createAt: string;
  updateAt: string | null;
  deleteAt: string | null;
  userId: number;
  userName: string;
  paymentMethod: string | null;
  amountPaid: string | null;
  discountCode: string | null;
  discountPercent: number | null;
}

interface OrderDetail {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  size: string;
  note: string;
  childItems: OrderDetailChild[];
  combo: boolean;
}

interface OrderDetailChild {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  size: string;
  note: string;
  childItems: OrderDetailChild[];
  combo: boolean;
}
interface ApiResponse {
  data: Order[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

const StaffProccessingOrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(1000);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("PREPARING");
  const [completeModalVisible, setCompleteModalVisible] =
    useState<boolean>(false);
  const [cancelModalVisible, setCancelModalVisible] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] =
    useState<boolean>(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuthState();
  console.log(actionLoading);

  useEffect(() => {
    // Check if user is logged in and has the correct role
    if (!isLoggedIn || role !== "STAFF") {
      message.error("Bạn không có quyền truy cập trang này");
      navigate("/");
      return;
    }

    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, statusFilter, isLoggedIn, role, navigate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(
        `https://beautiful-unity-production.up.railway.app/api/v2/orders/me?page=${
          currentPage - 1
        }&size=${pageSize}&status=${statusFilter}`,
        getAuthHeaders()
      );

      setOrders(response.data.data);
      setTotalElements(response.data.totalElements);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Không thể tải danh sách đơn hàng");
      setLoading(false);

      // Handle unauthorized access
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        navigate("/");
      }
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      setDetailsLoading(true);
      const response = await axios.get<OrderDetail[]>(
        `https://beautiful-unity-production.up.railway.app/api/orders/${orderId}/details`,
        getAuthHeaders()
      );
      setOrderDetails(response.data);
      setDetailsLoading(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
      message.error("Không thể tải chi tiết đơn hàng");
      setDetailsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchOrders();
  };

  const handleReset = () => {
    setSearchText("");
    setStatusFilter("PREPARING");
    setCurrentPage(1);
    fetchOrders();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PREPARING":
        return "Đang chuẩn bị";
      case "DELIVERED":
        return "Đã giao";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const showCompleteModal = (orderId: number) => {
    setSelectedOrderId(orderId);
    setCompleteModalVisible(true);
  };

  const showCancelModal = (orderId: number) => {
    setSelectedOrderId(orderId);
    setCancelModalVisible(true);
  };

  const showDetailsModal = (order: Order) => {
    setSelectedOrder(order);
    setSelectedOrderId(order.id);
    fetchOrderDetails(order.id);
    setDetailsModalVisible(true);
  };

  const handleCompleteOrder = async () => {
    if (!selectedOrderId) return;

    try {
      setActionLoading(true);
      await axios.put(
        `https://beautiful-unity-production.up.railway.app/api/v2/orders/${selectedOrderId}/status?status=DELIVERED`,
        {},
        getAuthHeaders()
      );
      message.success(`Đơn hàng #${selectedOrderId} đã được hoàn thành`);
      setCompleteModalVisible(false);
      fetchOrders();
    } catch (error) {
      console.error("Error completing order:", error);
      message.error("Không thể hoàn thành đơn hàng");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;

    try {
      setActionLoading(true);
      await axios.put(
        `https://beautiful-unity-production.up.railway.app/api/v2/orders/${selectedOrderId}/status?status=CANCELLED`,
        {},
        getAuthHeaders()
      );
      message.success(`Đơn hàng #${selectedOrderId} đã được hủy`);
      setCancelModalVisible(false);
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      message.error("Không thể hủy đơn hàng");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    try {
      const parts = date.split(/[/ :]/);
      if (parts.length >= 6) {
        const [day, month, year, hours, minutes, seconds] = parts;
        const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
          2,
          "0"
        )}T${hours.padStart(2, "0")}:${minutes.padStart(
          2,
          "0"
        )}:${seconds.padStart(2, "0")}`;
        const dateObj = new Date(isoDate);
        if (!isNaN(dateObj.getTime())) {
          return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(dateObj);
        }
      }
      return date;
    } catch (error) {
      console.error("Error formatting date:", date, error);
      return date || "N/A";
    }
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      render: (id: number) => <strong>#{id}</strong>,
    },
    {
      title: "Người thực hiện",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) => formatCurrency(price),
      sorter: (a: Order, b: Order) => a.totalPrice - b.totalPrice,
    },
    {
      title: "Số tiền thanh toán",
      dataIndex: "amountPaid",
      key: "amountPaid",
      render: (amount: string | null) =>
        amount ? formatCurrency(Number(amount)) : "Chưa thanh toán",
    },
    {
      title: "Mã giảm giá",
      dataIndex: "discountCode",
      key: "discountCode",
      render: (code: string | null, record: Order) =>
        code ? `${code} (${record.discountPercent}%)` : "Không có",
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string | null) => method || "Chưa thanh toán",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <StatusTag status={status}>{getStatusText(status)}</StatusTag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createAt",
      key: "createAt",
    },
    {
      title: "Cập nhật lần cuối",
      dataIndex: "updateAt",
      key: "updateAt",
      render: (date: string | null) => date || "Chưa cập nhật",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: unknown, record: Order) => (
        <ActionButtonsContainer>
          <StyledButton
            type="default"
            icon={<EyeOutlined />}
            onClick={() => showDetailsModal(record)}
          >
            Xem chi tiết
          </StyledButton>
          {record.status === "PREPARING" && (
            <>
              <StyledButton
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => showCompleteModal(record.id)}
                loading={actionLoading}
              >
                Hoàn thành đơn
              </StyledButton>
              <StyledButton
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => showCancelModal(record.id)}
                loading={actionLoading}
              >
                Hủy đơn
              </StyledButton>
            </>
          )}
        </ActionButtonsContainer>
      ),
    },
  ];

  const filteredOrders = orders.filter((order) => {
    return (
      order.id.toString().includes(searchText) ||
      order.userName.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  return (
    <Container>
      <div style={{ marginBottom: "16px" }}>
        <StyledButton
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/staff/products")}
        >
          Quay lại trang sản phẩm
        </StyledButton>
      </div>
      <Header>
        <HeaderTitle>
          <IconContainer>
            <ShoppingOutlined />
          </IconContainer>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Đơn hàng đang xử lý
            </Title>
            <Text type="secondary">
              Quản lý và theo dõi các đơn hàng đang được xử lý
            </Text>
          </div>
        </HeaderTitle>
      </Header>

      <ContentCard>
        <FilterSection>
          <StyledInput
            placeholder="Tìm kiếm theo mã đơn hàng hoặc tên khách hàng"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            allowClear
          />

          <StyledSelect
            placeholder="Trạng thái đơn hàng"
            style={{ width: 200 }}
            value={statusFilter}
            onChange={(value: unknown) => setStatusFilter(value as string)}
          >
            <Option value="DELIVERED">Đã giao</Option>
            <Option value="PREPARING">Đang chuẩn bị</Option>
            <Option value="CANCELLED">Đã hủy</Option>
          </StyledSelect>

          <StyledButton
            type="primary"
            icon={<FilterOutlined />}
            onClick={handleSearch}
          >
            Lọc
          </StyledButton>

          <StyledButton icon={<ReloadOutlined />} onClick={handleReset}>
            Đặt lại
          </StyledButton>
        </FilterSection>

        {loading ? (
          <LoadingContainer>
            <Spin size="large" tip="Đang tải đơn hàng..." />
          </LoadingContainer>
        ) : (
          <>
            <Table<Order>
              columns={columns}
              dataSource={filteredOrders}
              rowKey="id"
              pagination={false}
              bordered
              scroll={{ x: 1000 }}
              locale={{ emptyText: "Không có đơn hàng nào" }}
            />

            <PaginationContainer>
              <div>
                Hiển thị {filteredOrders.length} trên tổng số {totalElements}{" "}
                đơn hàng
              </div>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalElements}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger
                onShowSizeChange={(_current, size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                pageSizeOptions={["10", "20", "50", "100"]}
              />
            </PaginationContainer>
          </>
        )}
      </ContentCard>
      <Modal
        title="Xác nhận hoàn thành đơn hàng"
        open={completeModalVisible}
        onOk={() => handleCompleteOrder()} // or simply onOk={handleCompleteOrder}
        onCancel={() => setCompleteModalVisible(false)}
        confirmLoading={actionLoading}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn hoàn thành đơn hàng #{selectedOrderId}?</p>
        <p>Đơn hàng sẽ được chuyển sang trạng thái "Đã giao".</p>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        title="Xác nhận hủy đơn hàng"
        open={cancelModalVisible}
        onOk={() => handleCancelOrder()} // or simply onOk={handleCancelOrder}
        onCancel={() => setCancelModalVisible(false)}
        confirmLoading={actionLoading}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn hủy đơn hàng #{selectedOrderId}?</p>
        <p>
          Đơn hàng sẽ được chuyển sang trạng thái "Đã hủy" và không thể khôi
          phục.
        </p>
      </Modal>

      <Modal
        title="Chi tiết đơn hàng"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Mã đơn">
                {selectedOrder.id}
              </Descriptions.Item>
              <Descriptions.Item label="Người thực hiện">
                {selectedOrder.userName}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                {formatCurrency(selectedOrder.totalPrice)}
              </Descriptions.Item>
              {selectedOrder.discountCode && (
                <Descriptions.Item label="Mã giảm giá">
                  {selectedOrder.discountCode} ({selectedOrder.discountPercent}
                  %)
                </Descriptions.Item>
              )}
              {selectedOrder.amountPaid && (
                <Descriptions.Item label="Số tiền thanh toán">
                  {formatCurrency(Number(selectedOrder.amountPaid))}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Trạng thái">
                <StatusTag status={selectedOrder.status}>
                  {getStatusText(selectedOrder.status)}
                </StatusTag>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {selectedOrder.paymentMethod || "Chưa thanh toán"}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian tạo">
                {formatDate(selectedOrder.createAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian cập nhật">
                {formatDate(selectedOrder.updateAt)}
              </Descriptions.Item>
            </Descriptions>

            {detailsLoading ? (
              <LoadingContainer>
                <Spin size="large" tip="Đang tải chi tiết đơn hàng..." />
              </LoadingContainer>
            ) : orderDetails.length > 0 ? (
              <>
                <Typography.Title level={5} style={{ marginTop: 24 }}>
                  Sản phẩm đã đặt
                </Typography.Title>
                <Table
                  dataSource={orderDetails}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    {
                      title: "Sản phẩm",
                      dataIndex: "productName",
                      key: "productName",
                      render: (text, record: OrderDetail) => (
                        <>
                          <strong>{text}</strong>
                          {record.childItems?.length > 0 && (
                            <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                              {record.childItems.map((child) => (
                                <li key={child.id}>
                                  {child.productName} - Size: {child.size} - SL:{" "}
                                  {child.quantity} - Giá:{" "}
                                  {formatCurrency(child.unitPrice)}
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ),
                    },
                    {
                      title: "Size",
                      dataIndex: "size",
                      key: "size",
                    },
                    {
                      title: "Số lượng",
                      dataIndex: "quantity",
                      key: "quantity",
                    },
                    {
                      title: "Đơn giá",
                      dataIndex: "unitPrice",
                      key: "unitPrice",
                      render: (price: number, record: OrderDetail) => {
                        const extraPrice = record.childItems?.reduce(
                          (sum: number, item: OrderDetailChild) =>
                            sum + item.unitPrice * item.quantity,
                          0
                        );
                        return (
                          <>
                            {formatCurrency(price)}
                            {extraPrice > 0 &&
                              ` + ${formatCurrency(
                                extraPrice
                              )} (Sản phẩm kèm theo)`}
                          </>
                        );
                      },
                    },
                    {
                      title: "Tổng tiền",
                      key: "total",
                      render: (_: unknown, record: OrderDetail) => {
                        const price = record.unitPrice;
                        const quantity = record.quantity;
                        const extraPrice =
                          record.childItems?.reduce(
                            (sum: number, item: OrderDetailChild) =>
                              sum + item.unitPrice * item.quantity,
                            0
                          ) || 0;
                        const totalPrice = price * quantity + extraPrice;
                        return formatCurrency(totalPrice);
                      },
                    },
                    {
                      title: "Ghi chú",
                      dataIndex: "note",
                      key: "note",
                    },
                  ]}
                />
                <Descriptions
                  bordered
                  column={1}
                  size="small"
                  style={{ marginTop: 16 }}
                >
                  <Descriptions.Item label="Tổng hóa đơn trước giảm giá">
                    <strong>
                      {formatCurrency(
                        orderDetails.reduce(
                          (total: number, item: OrderDetail) => {
                            const itemTotal =
                              item.unitPrice * item.quantity +
                              (item.childItems?.reduce(
                                (sum: number, child: OrderDetailChild) =>
                                  sum + child.unitPrice * child.quantity,
                                0
                              ) || 0);
                            return total + itemTotal;
                          },
                          0
                        )
                      )}
                    </strong>
                  </Descriptions.Item>

                  {selectedOrder?.discountCode && (
                    <Descriptions.Item label="Giảm giá">
                      <strong>
                        {selectedOrder.discountCode} (
                        {selectedOrder.discountPercent}%)
                      </strong>
                    </Descriptions.Item>
                  )}

                  <Descriptions.Item label="Tổng hóa đơn sau giảm giá">
                    <strong>
                      {selectedOrder?.amountPaid
                        ? formatCurrency(Number(selectedOrder.amountPaid))
                        : formatCurrency(selectedOrder?.totalPrice || 0)}
                    </strong>
                  </Descriptions.Item>
                </Descriptions>
              </>
            ) : (
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <Text type="secondary">
                  Không có thông tin chi tiết đơn hàng
                </Text>
              </div>
            )}
          </>
        )}
      </Modal>
    </Container>
  );
};

export default StaffProccessingOrdersScreen;
