import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Divider,
  message,
  Spin,
  Tag,
  Empty,
  Popconfirm,
  Drawer,
  Modal,
  Radio,
  Input,
  Space
} from "antd";
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  CreditCardOutlined,
  MinusCircleOutlined,
  DollarOutlined,
  MobileOutlined
} from "@ant-design/icons";
import {
  OrderSummary,
  SummaryInfo,
  SummaryActions,
  LoadingContainer,
  ActionButton,
} from "../components/styled components/StaffCartStyles";
import axios from "axios";

const { Text } = Typography;
const { TextArea } = Input;

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

interface CartProps {
  visible: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ visible, onClose }) => {
  const [order, setOrder] = useState<Order | null>(null);
  console.log(order)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  console.log(error)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [paymentJustCompleted, setPaymentJustCompleted] = useState<boolean>(false);
  
  // New state variables for payment modal
  const [paymentModalVisible, setPaymentModalVisible] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("MOMO");
  const [cashNote, setCashNote] = useState<string>("");

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
        setOrderItems([]);
        setOrder(null);
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
        return;
      }

      if (paymentCompleted === "true") {
        localStorage.removeItem("paymentCompleted"); // Clear the flag
        setOrderItems([]);
        setOrder(null);
        setLoading(false);
        return;
      }

      if (!currentOrderId) {
        setOrderItems([]);
        setOrder(null);
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
      } else {
        setError("Không thể tải thông tin giỏ hàng. Vui lòng thử lại sau.");
      }

      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchOrderDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, refreshTrigger, paymentJustCompleted]);

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
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
    try {
      const currentOrderId = localStorage.getItem("currentOrderId");

      if (!currentOrderId) {
        message.warning("Không có đơn hàng để hủy");
        return;
      }

      setLoading(true);
      const authAxios = getAuthAxios();

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

  // Show payment method selection modal
  const showPaymentModal = () => {
    const currentOrderId = localStorage.getItem("currentOrderId");
    if (!currentOrderId) {
      message.warning("Không có đơn hàng để thanh toán");
      return;
    }
    
    setPaymentModalVisible(true);
    setPaymentMethod("MOMO"); // Default to MOMO
    setCashNote(""); // Reset cash note
  };

  // Handle payment based on selected method
  const handlePaymentConfirm = async () => {
    setPaymentModalVisible(false);
    
    if (paymentMethod === "CASH") {
      processCashPayment();
    } else {
      processMomoPayment();
    }
  };

  // Process cash payment
  const processCashPayment = async () => {
    try {
      const currentOrderId = localStorage.getItem("currentOrderId");
      if (!currentOrderId) {
        message.warning("Không có đơn hàng để thanh toán");
        return;
      }

      setLoading(true);
      const authAxios = getAuthAxios();
      console.log(authAxios)

      const requestBody = {
        orderId: parseInt(currentOrderId),
        paymentMethod: "CASH",
        note: cashNote
      };
      console.log(requestBody)

      // This is a placeholder - you'll need to implement the actual API endpoint
      // await authAxios.post("/api/payment/cash", requestBody);
      
      // For demonstration, just show success message
      message.success("Đã đặt hàng thành công! Vui lòng thanh toán khi nhận hàng.");
      
      // Clear the cart
      localStorage.removeItem("currentOrderId");
      setOrder(null);
      setOrderItems([]);
      setLoading(false);
    } catch (error) {
      console.error("Error processing cash payment:", error);
      message.error("Không thể xử lý thanh toán tiền mặt. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Process Momo payment (existing functionality)
  const processMomoPayment = async () => {
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

  const hasOrder = orderItems.length > 0;

  if (loading) {
    return (
      <Drawer
        title="Giỏ hàng"
        placement="right"
        onClose={onClose}
        open={visible}
        width={500}
        footer={null}
      >
        <LoadingContainer>
          <Spin size="large" tip="Đang tải..." />
        </LoadingContainer>
      </Drawer>
    );
  }

  return (
    <>
      <Drawer
        title={
          <div className="flex items-center">
            <ShoppingCartOutlined style={{ fontSize: '20px', marginRight: '10px' }} />
            <span>Giỏ hàng</span>
          </div>
        }
        placement="right"
        onClose={onClose}
        open={visible}
        width={500}
        footer={
          hasOrder ? (
            <div className="p-4 border-t">
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
                    onClick={showPaymentModal}
                    className="green"
                  >
                    Thanh toán
                  </ActionButton>
                </SummaryActions>
              </OrderSummary>
            </div>
          ) : null
        }
      >
        {hasOrder ? (
          <div className="cart-items">
            {orderItems.map((item, index) => (
              <div 
                key={item.id} 
                className={index > 0 ? "pt-4 mt-4 border-t border-gray-200" : ""}
              >
                {renderOrderItems([item])}
              </div>
            ))}
            <Divider />
          </div>
        ) : (
          <Empty
            description="Không có sản phẩm nào trong giỏ hàng"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Drawer>

      {/* Payment Method Selection Modal */}
      <Modal
        title="Chọn phương thức thanh toán"
        open={paymentModalVisible}
        onOk={handlePaymentConfirm}
        onCancel={() => setPaymentModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <div className="payment-options">
          <Radio.Group 
            onChange={(e) => setPaymentMethod(e.target.value)} 
            value={paymentMethod}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio value="MOMO" style={{ marginBottom: '16px' }}>
                <div className="flex items-center">
                  <MobileOutlined style={{ color: '#ae2070', fontSize: '20px', marginRight: '8px' }} />
                  <span>Thanh toán qua MOMO</span>
                </div>
              </Radio>
              
              <Radio value="CASH">
                <div className="flex items-center">
                  <DollarOutlined style={{ color: '#52c41a', fontSize: '20px', marginRight: '8px' }} />
                  <span>Thanh toán tiền mặt khi nhận hàng</span>
                </div>
              </Radio>
              
              {paymentMethod === "CASH" && (
                <div style={{ marginTop: '12px', marginLeft: '32px' }}>
                  <TextArea
                    placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                    value={cashNote}
                    onChange={(e) => setCashNote(e.target.value)}
                    rows={3}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </Space>
          </Radio.Group>
        </div>
      </Modal>
    </>
  );
};

export default Cart;