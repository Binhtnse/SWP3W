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
  Space,
  InputNumber,
  Alert,
  Tooltip,
} from "antd";
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  CreditCardOutlined,
  DollarOutlined,
  MobileOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  TagOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import {
  OrderSummary,
  SummaryActions,
  LoadingContainer,
  ActionButton,
  CartItemContainer,
  CartItemActions,
  PromotionButton,
  PromotionTag,
  PromotionModalContent,
  PromotionItem,
  PromotionSummary
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

interface CashDrawer {
  id: number;
  date: string;
  openingBalance: number;
  currentBalance: number;
  openedAt: string;
  closedAt: string | null;
  note: string | null;
  open: boolean;
}

interface Promotion {
  id: number;
  name: string;
  code: string;
  description: string;
  minTotal: number;
  discountPercent: number;
  dateOpen: string;
  dateEnd: string;
  status: string;
}

interface PromotionResponse {
  data: Promotion[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

interface CartProps {
  visible: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ visible, onClose }) => {
  const [order, setOrder] = useState<Order | null>(null);
  console.log(order);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  console.log(error);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [paymentJustCompleted, setPaymentJustCompleted] =
    useState<boolean>(false);
  const [paymentModalVisible, setPaymentModalVisible] =
    useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("MOMO");
  const [cashNote, setCashNote] = useState<string>("");
  console.log(cashNote);
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<OrderItem | null>(null);
  const [updatedQuantity, setUpdatedQuantity] = useState<number>(1);
  const [updatedSize, setUpdatedSize] = useState<string>("");
  const [cashAmount, setCashAmount] = useState<number | null>(null);
  const [cashError, setCashError] = useState<string | null>(null);
  const [changeAmount, setChangeAmount] = useState<number | null>(null);
  const [cashDrawerBalance, setCashDrawerBalance] = useState<number | null>(
    null
  );
  const [cashDrawerError, setCashDrawerError] = useState<boolean>(false);
  const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>(
    []
  );
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );
  const [loadingPromotions, setLoadingPromotions] = useState<boolean>(false);
  const [promotionValidationLoading, setPromotionValidationLoading] =
    useState<boolean>(false);
  const [promotionError, setPromotionError] = useState<string | null>(null);
  const [promotionModalVisible, setPromotionModalVisible] = useState<boolean>(false);
  console.log(cashDrawerError);

  const getAuthAxios = () => {
    const accessToken = localStorage.getItem("accessToken");
    return axios.create({
      baseURL: "https://beautiful-unity-production.up.railway.app",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  };

  const fetchCashDrawerBalance = async () => {
    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.get<CashDrawer>(
        "/api/v1/cash-drawer/current"
      );
      setCashDrawerBalance(response.data.currentBalance);
    } catch (error) {
      console.error("Error fetching cash drawer balance:", error);
      setCashDrawerError(true);
    }
  };

  const fetchAvailablePromotions = async (totalPrice: number) => {
    try {
      setLoadingPromotions(true);
      const authAxios = getAuthAxios();
      const response = await authAxios.get<PromotionResponse>(
        `/api/v1/promotions/all?page=0&size=20&price=${totalPrice}`
      );

      setAvailablePromotions(response.data.data);

      // If there are promotions available and none selected yet, select the first one
      if (response.data.data.length > 0 && !selectedPromotion) {
        setSelectedPromotion(response.data.data[0]);
      } else if (response.data.data.length === 0) {
        // If no promotions are available, clear the selected promotion
        setSelectedPromotion(null);
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
      message.error("Không thể tải khuyến mãi. Vui lòng thử lại sau.");
    } finally {
      setLoadingPromotions(false);
    }
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

  const validatePromotion = async (promotionId: number) => {
    try {
      setPromotionValidationLoading(true);
      setPromotionError(null);
      
      const currentOrderId = localStorage.getItem("currentOrderId");
      if (!currentOrderId) {
        setPromotionError("Không tìm thấy thông tin đơn hàng");
        return false;
      }
      
      const authAxios = getAuthAxios();
      const response = await authAxios.get(
        `/api/v1/promotions/check?promotionId=${promotionId}&orderId=${currentOrderId}`
      );
      console.log(response)
      
      return true;
    } catch (error) {
      console.error("Error validating promotion:", error);
      
      if (axios.isAxiosError(error) && error.response?.data) {
        setPromotionError(error.response.data.details || error.response.data.message || "Mã khuyến mãi không hợp lệ");
      } else {
        setPromotionError("Không thể xác thực mã khuyến mãi. Vui lòng thử lại sau.");
      }
      
      return false;
    } finally {
      setPromotionValidationLoading(false);
    }
  };

  const handlePromotionSelect = async (promotionId: number) => {
    const promotion = availablePromotions.find(promo => promo.id === promotionId) || null;
    
    if (promotion) {
      const isValid = await validatePromotion(promotion.id);
      if (isValid) {
        setSelectedPromotion(promotion);
        setPromotionError(null);
      } else {
        // If validation fails, don't select the promotion
        setSelectedPromotion(null);
      }
    } else {
      setSelectedPromotion(null);
      setPromotionError(null);
    }
  };

  const calculateItemTotal = (item: OrderItemChild): number => {
    // Base price for the item itself
    const basePrice = item.unitPrice * item.quantity;

    // Add up prices of all child items (toppings)
    const toppingsTotal = item.childItems.reduce((sum, childItem) => {
      return sum + childItem.unitPrice * childItem.quantity;
    }, 0);

    return basePrice + toppingsTotal;
  };

  useEffect(() => {
    if (visible) {
      fetchOrderDetails().then(() => {
        // After fetching order details, fetch promotions based on the total amount
        if (orderItems.length > 0) {
          const totalAmount = calculateTotalAmount();
          fetchAvailablePromotions(totalAmount);
        }
      });
      fetchCashDrawerBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, refreshTrigger, paymentJustCompleted]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateDiscountedTotal = () => {
    const totalAmount = calculateTotalAmount();

    if (selectedPromotion) {
      const discountAmount =
        (totalAmount * selectedPromotion.discountPercent) / 100;
      return totalAmount - discountAmount;
    }

    return totalAmount;
  };

  const showPromotionModal = () => {
  if (orderItems.length > 0) {
    const totalAmount = calculateTotalAmount();
    fetchAvailablePromotions(totalAmount);
    setPromotionModalVisible(true);
  } else {
    message.warning("Không có sản phẩm nào trong giỏ hàng để áp dụng khuyến mãi");
  }
};

const clearSelectedPromotion = () => {
  setSelectedPromotion(null);
  setPromotionError(null);
};

const renderPromotionModal = () => {
  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <TagOutlined style={{ color: "#7c3aed", marginRight: 8 }} />
          <span>Chọn mã khuyến mãi</span>
        </div>
      }
      open={promotionModalVisible}
      onCancel={() => setPromotionModalVisible(false)}
      footer={[
        <Button 
          key="clear" 
          danger
          onClick={clearSelectedPromotion}
          disabled={!selectedPromotion}
          icon={<CloseCircleOutlined />}
        >
          Xóa khuyến mãi
        </Button>,
        <Button key="cancel" onClick={() => setPromotionModalVisible(false)}>
          Hủy
        </Button>,
        <Button
          key="apply"
          type="primary"
          onClick={() => {
            setPromotionModalVisible(false);
          }}
          style={{ backgroundColor: "#7c3aed", borderColor: "#7c3aed" }}
        >
          Áp dụng
        </Button>,
      ]}
      width={500}
    >
      <PromotionModalContent>
        {promotionError && (
          <Alert 
            message={promotionError} 
            type="error" 
            showIcon 
            style={{ marginBottom: 16 }}
          />
        )}
        
        {loadingPromotions ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <Spin size="default" />
            <div style={{ marginTop: 8 }}>Đang tải khuyến mãi...</div>
          </div>
        ) : availablePromotions.length === 0 ? (
          <Empty 
            description="Không có khuyến mãi khả dụng" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        ) : (
          <Radio.Group
            onChange={(e) => handlePromotionSelect(e.target.value)}
            value={selectedPromotion?.id}
            style={{ width: "100%" }}
            disabled={promotionValidationLoading}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              {availablePromotions.map((promotion) => (
                <Radio key={promotion.id} value={promotion.id} style={{ width: "100%", marginRight: 0 }}>
                  <PromotionItem className={selectedPromotion?.id === promotion.id ? "selected" : ""}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                        <Text strong>{promotion.name}</Text>
                        <Tag color="green" style={{ marginLeft: 8 }}>
                          {promotion.code}
                        </Tag>
                      </div>
                      <div>
                        <Text type="secondary">{promotion.description}</Text>
                      </div>
                      <div>
                        <Text type="secondary">
                          Giảm: <Text strong type="danger">{promotion.discountPercent}%</Text>
                        </Text>
                      </div>
                    </div>
                  </PromotionItem>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        )}
        
        {promotionValidationLoading && (
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Spin size="small" />
            <Text style={{ marginLeft: 8 }}>Đang xác thực mã khuyến mãi...</Text>
          </div>
        )}
      </PromotionModalContent>
    </Modal>
  );
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

  const showUpdateModal = (item: OrderItem) => {
    setCurrentItem(item);
    setUpdatedQuantity(item.quantity);
    setUpdatedSize(item.size || "NONE"); // Set the current size
    setUpdateModalVisible(true);
  };

  // Function to update an item in the cart
  const handleUpdateItem = async () => {
    if (!currentItem) return;

    try {
      const currentOrderId = localStorage.getItem("currentOrderId");
      if (!currentOrderId) {
        message.error("Không tìm thấy thông tin đơn hàng");
        return;
      }

      setLoading(true);
      const authAxios = getAuthAxios();

      // Use the correct API URL with query parameters
      await authAxios.put(
        `/api/v2/orders/${currentOrderId}/details/${currentItem.id}/update?size=${updatedSize}&quantity=${updatedQuantity}`
      );

      message.success("Đã cập nhật sản phẩm trong giỏ hàng");
      setUpdateModalVisible(false);

      // Refresh the order details
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating item in cart:", error);
      message.error("Không thể cập nhật sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
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
        className={index > 0 ? "mt-3 pt-3 border-t border-gray-200" : ""}
      >
        <div
          className={`${level > 0 ? "ml-4" : ""} flex flex-col`}
          style={{ paddingLeft: level * 12 }}
        >
          <div className="flex justify-between items-center mb-2 w-full">
            <div className="flex items-center flex-grow">
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
              <span
                className="font-medium text-lg text-primary"
                style={{
                  fontWeight: 600,
                  color: "#1890ff",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                {item.productName}
              </span>
            </div>

            {level === 0 && (
              <CartItemActions>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => showUpdateModal(item)}
                  style={{ marginRight: 8 }}
                >
                  Sửa
                </Button>
                <Popconfirm
                  title="Xóa sản phẩm"
                  description="Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?"
                  onConfirm={() => handleRemoveItem(item.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  >
                    Xóa
                  </Button>
                </Popconfirm>
              </CartItemActions>
            )}
          </div>

          <div
            className={`text-sm ${level > 0 ? "ml-4" : ""}`}
            style={{ paddingLeft: level > 0 ? 0 : 0 }}
          >
            {/* Display information in separate rows */}
            {item.size && item.size !== "NONE" && (
              <div className="text-gray-600 mb-1">
                <strong>Size:</strong> {item.size}
              </div>
            )}
            <div className="text-gray-600 mb-1">
              <strong>Số lượng:</strong> {item.quantity}
            </div>
            {item.unitPrice && (
              <div className="text-gray-600 mb-1">
                <strong>Đơn giá:</strong> {formatCurrency(item.unitPrice)}
              </div>
            )}
            {item.note && (
              <div className="text-gray-600 mb-1">
                <strong>Ghi chú:</strong> {item.note}
              </div>
            )}
          </div>

          {/* Render child items (toppings) */}
          {item.childItems && item.childItems.length > 0 && (
            <div className="mt-2">
              {renderOrderItems(item.childItems, level + 1)}
            </div>
          )}

          {/* Add total price for main items (level 0) AFTER the toppings */}
          {level === 0 && (
            <div
              className="mt-3 pt-2 border-t border-dashed border-gray-200 flex justify-between items-center"
              style={{ marginTop: "8px" }}
            >
              <Text strong style={{ fontSize: "15px" }}>
                Thành tiền:
              </Text>
              <Text
                type="danger"
                strong
                style={{
                  fontSize: "16px",
                  marginLeft: "auto",
                }}
              >
                {formatCurrency(calculateItemTotal(item))}
              </Text>
            </div>
          )}
        </div>
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

      // Instead of removing each item individually, change the order status to CANCELLED
      await authAxios.put(
        `/api/v2/orders/${currentOrderId}/status?status=CANCELLED`,
        {}
      );

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
    setCashAmount(null); // Reset cash amount
    setCashError(null); // Reset cash error
    setChangeAmount(null); // Reset change amount
  };

  // Process cash payment
  const handlePaymentConfirm = async () => {
    // For cash payment, validate the amount first
    if (paymentMethod === "CASH") {
      const totalAmount = calculateDiscountedTotal(); 

      if (!cashAmount) {
        message.error("Vui lòng nhập số tiền thanh toán");
        return;
      }

      if (cashAmount < totalAmount) {
        message.error("Số tiền không đủ để thanh toán");
        return;
      }
    }

    if (selectedPromotion) {
      const isValid = await validatePromotion(selectedPromotion.id);
      if (!isValid) {
        message.error("Mã khuyến mãi không hợp lệ. Vui lòng chọn mã khác hoặc tiếp tục không dùng khuyến mãi.");
        return;
      }
    }

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

      const requestBody = {
        orderId: parseInt(currentOrderId),
        paymentMethod: "CASH",
        promotionId: selectedPromotion?.id || null,
      };

      // Make the actual API call to the cash payment endpoint
      await authAxios.post("/api/payment/cash", requestBody);

      message.success(
        "Đã đặt hàng thành công! Vui lòng thanh toán khi nhận hàng."
      );

      // Clear the cart
      localStorage.removeItem("currentOrderId");
      setOrder(null);
      setOrderItems([]);
      setLoading(false);
    } catch (error) {
      console.error("Error processing cash payment:", error);
      message.error(
        "Không thể xử lý thanh toán tiền mặt. Vui lòng thử lại sau."
      );
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
        promotionId: selectedPromotion?.id || null,
      };

      try {
        // Call the payment API to get the payment URL
        const paymentResponse = await authAxios.post(
          "/api/payment",
          requestBody
        );

        // Extract the payment URL from the response
        const payUrl = paymentResponse.data.payUrl;

        if (payUrl) {
          // Open the payment URL in a new window
          window.open(payUrl, "_blank");
          message.success({
            content:
              "Đã mở cổng thanh toán MOMO. Vui lòng hoàn tất thanh toán.",
            duration: 5,
          });
        } else {
          message.error("Không nhận được đường dẫn thanh toán từ MOMO");
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          // If we get a 409 error, call the re-momo API with the same request body
          try {
            const reMomoResponse = await authAxios.post(
              "/api/payment/re-momo",
              requestBody
            );
            const payUrl = reMomoResponse.data.payUrl;

            if (payUrl) {
              // Open the payment URL in a new window
              window.open(payUrl, "_blank");

              message.success({
                content:
                  "Đã mở cổng thanh toán MOMO. Vui lòng hoàn tất thanh toán.",
                duration: 5,
              });
            } else {
              message.error("Không nhận được đường dẫn thanh toán từ MOMO");
            }
          } catch (reMomoError) {
            console.error("Error with re-momo payment:", reMomoError);
            message.error(
              "Không thể khởi tạo lại thanh toán. Vui lòng thử lại sau."
            );
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

  const handleCashAmountChange = (value: number | null) => {
    setCashAmount(value);

    if (value === null) {
      setCashError("Vui lòng nhập số tiền");
      setChangeAmount(null);
      return;
    }

    const totalAmount = calculateDiscountedTotal(); 

    if (value < totalAmount) {
      setCashError("Số tiền không đủ để thanh toán");
      setChangeAmount(null);
    } else {
      setCashError(null);
      const change = value - totalAmount;
      setChangeAmount(change);

      // Check if there's enough money in the cash drawer for change
      if (cashDrawerBalance !== null && change > cashDrawerBalance) {
        setCashError("Không đủ tiền trong két để trả lại tiền thừa");
      }
    }
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
            <ShoppingCartOutlined
              style={{ fontSize: "20px", marginRight: "10px" }}
            />
            <span>Giỏ hàng</span>
          </div>
        }
        placement="right"
        onClose={onClose}
        open={visible}
        width={650}
        footer={
          hasOrder ? (
    <div className="p-4 border-t">
      <OrderSummary>
        <div style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <Text>Tổng cộng:</Text>
            <Text>
              <Text strong>{orderItems.length}</Text> sản phẩm
            </Text>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <Text>Tạm tính:</Text>
            <Text strong>{formatCurrency(calculateTotalAmount())}</Text>
          </div>
          
          {selectedPromotion ? (
            <PromotionSummary>
              <div>
                <Text strong>Khuyến mãi:</Text>
                <PromotionTag color="purple">{selectedPromotion.code}</PromotionTag>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  (-{selectedPromotion.discountPercent}%)
                </Text>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Text type="danger">
                  -{formatCurrency((calculateTotalAmount() * selectedPromotion.discountPercent) / 100)}
                </Text>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<CloseCircleOutlined />} 
                  onClick={clearSelectedPromotion}
                  style={{ marginLeft: 8, color: "#ff4d4f" }}
                />
              </div>
            </PromotionSummary>
          ) : (
            <PromotionButton 
              icon={<GiftOutlined />} 
              onClick={showPromotionModal}
            >
              Chọn mã khuyến mãi
            </PromotionButton>
          )}
          
          <Divider style={{ margin: "12px 0" }} />
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <Text strong style={{ fontSize: "16px" }}>Thành tiền:</Text>
            <Text strong type="danger" style={{ fontSize: "18px" }}>
              {formatCurrency(calculateDiscountedTotal())}
            </Text>
          </div>
          
          <SummaryActions>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
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
        </div>
      </OrderSummary>
    </div>
  ) : null
        }
      >
        {hasOrder ? (
          <div className="cart-items">
            {orderItems.map((item, index) => (
              <CartItemContainer
                key={item.id}
                className={index > 0 ? "border-t" : ""}
              >
                {renderOrderItems([item])}
              </CartItemContainer>
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
        okButtonProps={{
          disabled:
            paymentMethod === "CASH" &&
            (cashError !== null || cashAmount === null),
        }}
      >
        <div className="payment-options">
        {selectedPromotion && (
      <Alert
        message={`Áp dụng khuyến mãi: ${selectedPromotion.name} (${selectedPromotion.code})`}
        description={`Giảm ${selectedPromotion.discountPercent}% tổng hóa đơn`}
        type="success"
        showIcon
        style={{ marginBottom: 16 }}
      />
    )}
          <Radio.Group
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              // Reset cash-related states when switching payment methods
              if (e.target.value !== "CASH") {
                setCashAmount(null);
                setCashError(null);
                setChangeAmount(null);
              }
            }}
            value={paymentMethod}
            style={{ width: "100%" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Radio value="MOMO" style={{ marginBottom: "16px" }}>
                <div className="flex items-center">
                  <MobileOutlined
                    style={{
                      color: "#ae2070",
                      fontSize: "20px",
                      marginRight: "8px",
                    }}
                  />
                  <span>Thanh toán qua MOMO</span>
                </div>
              </Radio>

              <Radio value="CASH">
                <div className="flex items-center">
                  <DollarOutlined
                    style={{
                      color: "#52c41a",
                      fontSize: "20px",
                      marginRight: "8px",
                    }}
                  />
                  <span>Thanh toán tiền mặt</span>
                </div>
              </Radio>

              {paymentMethod === "CASH" && (
                <div style={{ marginTop: "12px", marginLeft: "32px" }}>
                  <div className="mb-3">
                    <Text strong>Tổng tiền cần thanh toán: </Text>
                    <Text type="danger" strong>
                    {formatCurrency(calculateDiscountedTotal())}
                    </Text>
                  </div>

                  <div className="mb-3">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Text>Số tiền khách đưa:</Text>
                      {cashDrawerBalance !== null && (
                        <Tooltip
                          title={`Số dư két tiền hiện tại: ${formatCurrency(
                            cashDrawerBalance
                          )}`}
                        >
                          <InfoCircleOutlined
                            style={{ marginLeft: "8px", color: "#1890ff" }}
                          />
                        </Tooltip>
                      )}
                    </div>
                    <InputNumber
                      style={{ width: "100%", marginTop: "8px" }}
                      min={0}
                      step={1000}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) =>
                        value ? Number(value.replace(/\$\s?|(,*)/g, "")) : 0
                      }
                      value={cashAmount}
                      onChange={handleCashAmountChange}
                      placeholder="Nhập số tiền khách đưa"
                    />
                    {cashError && (
                      <Alert
                        message={cashError}
                        type="error"
                        showIcon
                        style={{ marginTop: "8px" }}
                      />
                    )}
                  </div>

                  {changeAmount !== null && changeAmount > 0 && (
                    <div className="mb-3">
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Text strong>Tiền thừa: </Text>
                        <Text
                          type="success"
                          strong
                          style={{ marginLeft: "4px" }}
                        >
                          {formatCurrency(changeAmount)}
                        </Text>

                        {cashDrawerBalance !== null &&
                          changeAmount > cashDrawerBalance && (
                            <Tooltip title="Không đủ tiền trong két để trả lại tiền thừa">
                              <ExclamationCircleOutlined
                                style={{ marginLeft: "8px", color: "#ff4d4f" }}
                              />
                            </Tooltip>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Space>
          </Radio.Group>
        </div>
      </Modal>

      {/* Update Item Modal */}
      <Modal
        title="Cập nhật sản phẩm"
        open={updateModalVisible}
        onOk={handleUpdateItem}
        onCancel={() => setUpdateModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        {currentItem && (
          <div>
            <div className="mb-4">
              <Text strong>Sản phẩm: </Text>
              <Text
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#1890ff",
                  display: "inline-block",
                  marginLeft: "8px",
                }}
              >
                {currentItem.productName}
              </Text>
            </div>

            {/* Add size selection */}
            <div className="mb-4">
              <Text strong>Kích cỡ:</Text>
              <div className="mt-2">
                <Radio.Group
                  value={updatedSize}
                  onChange={(e) => setUpdatedSize(e.target.value)}
                  disabled={currentItem?.size === "NONE"} // Disable the entire group if size is NONE
                >
                  <Radio value="NONE">Mặc định</Radio>
                  <Radio value="S">Size S</Radio>
                  <Radio value="M">Size M</Radio>
                  <Radio value="L">Size L</Radio>
                </Radio.Group>
              </div>
              {currentItem?.size === "NONE" && (
                <Text
                  type="secondary"
                  style={{ display: "block", marginTop: "8px" }}
                >
                  Sản phẩm này không hỗ trợ thay đổi kích cỡ
                </Text>
              )}
            </div>

            <div className="mb-4">
              <Text strong>Số lượng:</Text>
              <div className="mt-2">
                <Input
                  type="number"
                  min={1}
                  value={updatedQuantity}
                  onChange={(e) =>
                    setUpdatedQuantity(parseInt(e.target.value) || 1)
                  }
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
      {renderPromotionModal()}
    </>
  );
};

export default Cart;
