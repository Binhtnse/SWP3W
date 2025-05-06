import React, { useState, useEffect } from "react";
import {
  Spin,
  message,
  Typography,
  Pagination,
  Select,
  Table,
  Modal,
} from "antd";
import {
  ShoppingOutlined,
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
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
            {record.status === "PREPARING" && (
              <StyledButton
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => showCompleteModal(record.id)}
                loading={actionLoading}
              >
                Hoàn thành đơn
              </StyledButton>
            )}
            {(record.status === "PREPARING") && (
              <StyledButton
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => showCancelModal(record.id)}
                loading={actionLoading}
              >
                Hủy đơn
              </StyledButton>
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
    </Container>
  );
};

export default StaffProccessingOrdersScreen;
