import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Divider,
  Table,
  message,
  Spin,
  Tag,
  Empty,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  DeleteOutlined,
  CreditCardOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import {
  StyledHeader,
  HeaderContent,
  LogoSection,
  IconContainer,
  TitleContainer,
  ContentSection,
  ActionButton,
  OrderSummary,
  SummaryInfo,
  SummaryActions,
  LoadingContainer,
  BackButton,
} from "../components/styled components/StaffCartStyles";
import axios from "axios";

const { Text } = Typography;

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

const StaffCartScreen: React.FC = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [paymentJustCompleted, setPaymentJustCompleted] = useState<boolean>(false);

  const getAuthAxios = () => {
    const accessToken = localStorage.getItem("accessToken");
    return axios.create({
      baseURL: "https://beautiful-unity-production.up.railway.app",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  };

  const fetchOrderDetails = async () => {
    try {
      if (paymentJustCompleted) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const currentOrderId = localStorage.getItem("currentOrderId");
      const paymentCompleted = localStorage.getItem("paymentCompleted");

      if (!userId) {
        message.error(
          "Không tìm thấy thông tin người dùng, vui lòng đăng nhập lại"
        );
        navigate("/");
        return;
      }

      if (paymentCompleted === "true") {
        localStorage.removeItem("paymentCompleted"); // Clear the flag
        setLoading(false);
        return;
      }

      if (!currentOrderId) {
        setLoading(false);
        return; // No order to fetch, will show empty cart
      }

      const authAxios = getAuthAxios();

      // Fetch the order details using the new API endpoint
      const detailsResponse = await authAxios.get<OrderItem[]>(
        `/api/v2/orders/${currentOrderId}/details`
      );

      setOrderItems(detailsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order details:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        localStorage.removeItem("currentOrderId");
        navigate("/");
      } else {
        setError("Không thể tải thông tin giỏ hàng. Vui lòng thử lại sau.");
      }

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, refreshTrigger, paymentJustCompleted]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status");
    const resultCode = urlParams.get("resultCode");
  
    if (status === "success" && resultCode === "0") {
      message.success("Thanh toán thành công!");
      localStorage.removeItem("currentOrderId");
      
      // Set states to empty
      setOrder(null);
      setOrderItems([]);
      setPaymentJustCompleted(true);
      
      // Remove the query parameters from the URL without triggering a reload
      window.history.replaceState({}, document.title, "/staff/cart");
    }
  }, []);

  const formatDate = (dateString: string) => {
    // The date format from API is "28/04/2025 01:59:52"
    return dateString;
  };

  // Function to remove an item from the cart
  const handleRemoveItem = async (orderDetailId: number) => {
    try {
      const currentOrderId = localStorage.getItem("currentOrderId");
      if (!currentOrderId) {
        message.error("Không tìm thấy thông tin đơn hàng");
        return;
      }

      const authAxios = getAuthAxios();
      await authAxios.delete(
        `/api/v2/orders/${currentOrderId}/details/${orderDetailId}`
      );

      message.success("Đã xóa sản phẩm khỏi giỏ hàng");

      // Refresh the order details
      setRefreshTrigger((prev) => prev + 1);

      // If this was the last item, check if we need to remove the order ID
      if (orderItems.length === 1) {
        // Fetch again to confirm if the order is now empty
        const detailsResponse = await authAxios.get<OrderItem[]>(
          `/api/v2/orders/${currentOrderId}/details`
        );

        if (detailsResponse.data.length === 0) {
          localStorage.removeItem("currentOrderId");
          setOrder(null);
          setOrderItems([]);
        }
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userRole");
          localStorage.removeItem("userId");
          localStorage.removeItem("currentOrderId");
          navigate("/");
        } else {
          message.error(
            `Không thể xóa sản phẩm: ${
              error.response?.data?.message || "Đã xảy ra lỗi"
            }`
          );
        }
      } else {
        message.error("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
      }
    }
  };

  // Helper function to render order items recursively
  const renderOrderItems = (
    items: OrderItemChild[],
    level = 0
  ): React.ReactNode => {
    return items.map((item, index) => (
      <div
        key={`${item.id}-${index}`}
        className={index > 0 ? "mt-2 pt-2 border-t border-gray-200" : ""}
      >
        <div
          className={`${level > 0 ? "ml-4" : ""} flex flex-col`}
          style={{ paddingLeft: level * 12 }}
        >
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              {level > 0 && (
                <Tag color="purple" style={{ marginRight: 8 }}>
                  Topping
                </Tag>
              )}
              {item.combo && (
                <Tag color="blue" style={{ marginRight: 8 }}>
                  Combo
                </Tag>
              )}
              <span className="font-medium">{item.productName} x{item.quantity}</span>
            </div>
  
            {level === 0 && (
              <Popconfirm
                title="Xóa sản phẩm"
                description="Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?"
                onConfirm={() => handleRemoveItem(item.id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  size="small"
                >
                  Xóa
                </Button>
              </Popconfirm>
            )}
          </div>
          
          <div
            className={`text-sm text-gray-500 ${level > 0 ? "ml-4" : ""}`}
            style={{ paddingLeft: level > 0 ? 0 : 0 }}
          >
            {item.size && item.size !== "NONE" && `Size: ${item.size}`}
            {item.unitPrice && `, Đơn giá: ${formatCurrency(item.unitPrice)}`}
            {item.note && `, Ghi chú: ${item.note}`}
          </div>
        </div>
        
        {item.childItems && item.childItems.length > 0 && (
          <div className="mt-1">
            {renderOrderItems(item.childItems, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const handleCancelOrder = async () => {
    console.log("handleCancelOrder called"); // Debug line
    try {
      const currentOrderId = localStorage.getItem("currentOrderId");
      console.log("Current order ID:", currentOrderId); // Debug line

      if (!currentOrderId) {
        message.warning("Không có đơn hàng để hủy");
        return;
      }

      setLoading(true);
      const authAxios = getAuthAxios();

      // Log the order items being deleted
      console.log("Order items to delete:", orderItems); // Debug line

      // Remove each item individually
      const removePromises = orderItems.map((item) =>
        authAxios.delete(`/api/v2/orders/${currentOrderId}/details/${item.id}`)
      );

      await Promise.all(removePromises);

      localStorage.removeItem("currentOrderId");
      setOrder(null);
      setOrderItems([]);
      message.success("Đã hủy đơn hàng");
      setLoading(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
      message.error("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const handlePayOrder = async () => {
    const currentOrderId = localStorage.getItem("currentOrderId");
    if (!currentOrderId) {
      message.warning("Không có đơn hàng để thanh toán");
      return;
    }
  
    try {
      setLoading(true);
      const authAxios = getAuthAxios();
      const requestBody = {
        orderId: parseInt(currentOrderId),
        paymentMethod: "MOMO",
      };
  
      try {
        // Call the payment API to get the payment URL
        const paymentResponse = await authAxios.post("/api/payment", requestBody);
  
        // Extract the payment URL from the response
        const payUrl = paymentResponse.data.payUrl;
  
        if (payUrl) {
          // Open the payment URL in a new window
          window.open(payUrl, "_blank");
  
          message.success({
            content: "Đã mở cổng thanh toán MOMO. Vui lòng hoàn tất thanh toán.",
            duration: 5,
          });
        } else {
          message.error("Không nhận được đường dẫn thanh toán từ MOMO");
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          // If we get a 409 error, call the re-momo API with the same request body
          try {
            const reMomoResponse = await authAxios.post("/api/payment/re-momo", requestBody);
            const payUrl = reMomoResponse.data.payUrl;
            
            if (payUrl) {
              // Open the payment URL in a new window
              window.open(payUrl, "_blank");
  
              message.success({
                content: "Đã mở cổng thanh toán MOMO. Vui lòng hoàn tất thanh toán.",
                duration: 5,
              });
            } else {
              message.error("Không nhận được đường dẫn thanh toán từ MOMO");
            }
          } catch (reMomoError) {
            console.error("Error with re-momo payment:", reMomoError);
            message.error("Không thể khởi tạo lại thanh toán. Vui lòng thử lại sau.");
          }
        } else {
          throw error; // Re-throw the error to be caught by the outer catch block
        }
      }
  
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error initiating payment:", error);
  
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userRole");
          localStorage.removeItem("userId");
          localStorage.removeItem("currentOrderId");
          navigate("/");
        } else {
          message.error(
            `Không thể thanh toán: ${
              error.response?.data?.message || "Đã xảy ra lỗi"
            }`
          );
        }
      } else {
        message.error("Không thể khởi tạo thanh toán. Vui lòng thử lại sau.");
      }
    }
  };

  const calculateTotalAmount = () => {
    if (!orderItems || orderItems.length === 0) {
      return 0;
    }

    return orderItems.reduce((total, item) => {
      // Calculate the price for this item (unitPrice * quantity)
      const itemTotal = item.unitPrice * item.quantity;

      // Add the price of any child items (toppings)
      const childTotal = item.childItems.reduce((childSum, childItem) => {
        return childSum + childItem.unitPrice * childItem.quantity;
      }, 0);

      return total + itemTotal + childTotal;
    }, 0);
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      render: () => {
        const currentOrderId = localStorage.getItem("currentOrderId");
        return (
          <Tag color="blue" className="text-base px-3 py-1">
            #{currentOrderId}
          </Tag>
        );
      },
    },
    {
      title: "Thông tin",
      dataIndex: "info",
      key: "info",
      render: () => (
        <div>
          <div className="font-semibold">
            Khách hàng: {order?.userName || "Khách lẻ"}
          </div>
          <div className="text-sm text-gray-500">
            Thời gian: {order?.createAt ? formatDate(order.createAt) : "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "items",
      key: "items",
      render: () => (
        <div>
          {orderItems && orderItems.length > 0 ? (
            renderOrderItems(orderItems)
          ) : (
            <Text type="secondary">Không có sản phẩm</Text>
          )}
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: () => (
        <div className="text-right font-semibold">
          {formatCurrency(calculateTotalAmount())}
        </div>
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
          <Text type="danger" style={{ fontSize: "16px" }}>
            {error}
          </Text>
          <Button
            type="primary"
            onClick={() => window.location.reload()}
            style={{ marginTop: "16px" }}
          >
            Thử lại
          </Button>
        </div>
      </LoadingContainer>
    );
  }

  const hasOrder = orderItems.length > 0;

  return (
    <div style={{ padding: "1.5rem" }}>
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
            onClick={() => navigate("/staff/products")}
            size="large"
          >
            Quay lại danh sách sản phẩm
          </BackButton>
        </HeaderContent>
      </StyledHeader>

      <ContentSection>
        {hasOrder ? (
          <>
            <Table
              dataSource={[{ key: "order" }]}
              columns={columns}
              pagination={false}
              rowKey="key"
              style={{ marginBottom: "1rem" }}
            />

            <Divider />

            <OrderSummary>
              <SummaryInfo>
                <Text style={{ marginRight: "0.5rem" }}>Tổng cộng:</Text>
                <Text strong>{orderItems.length}</Text>
                <Text style={{ margin: "0 0.5rem" }}>sản phẩm</Text>
                <Text
                  strong
                  style={{ marginLeft: "1rem", fontSize: "1.125rem" }}
                >
                  {formatCurrency(calculateTotalAmount())}
                </Text>
              </SummaryInfo>
              <SummaryActions>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    console.log("Cancel button clicked"); // Debug line
                    if (
                      window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")
                    ) {
                      handleCancelOrder();
                    }
                  }}
                >
                  Hủy đơn hàng
                </Button>
                <ActionButton
                  type="primary"
                  icon={<CreditCardOutlined />}
                  onClick={handlePayOrder}
                  className="green"
                >
                  Thanh toán
                </ActionButton>
              </SummaryActions>
            </OrderSummary>
          </>
        ) : (
          <Empty
            description="Không có sản phẩm nào trong giỏ hàng"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <ActionButton
              type="primary"
              onClick={() => navigate("/staff/products")}
              style={{ marginTop: "1rem" }}
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
