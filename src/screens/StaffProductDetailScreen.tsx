import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Image,
  Typography,
  Divider,
  Checkbox,
  Radio,
  InputNumber,
  Spin,
  message,
  Tag,
  Modal,
  RadioChangeEvent,
  Badge,
  Space,
} from "antd";
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  StarFilled,
  InfoCircleOutlined,
  CheckCircleFilled,
  SettingOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import axios from "axios";
import {
  PageContainer,
  BackButton,
  ProductCard,
  ProductContainer,
  ImageSection,
  ImageWrapper,
  DetailsSection,
  HeaderContainer,
  ProductInfo,
  TagsContainer,
  DescriptionBox,
  PriceText,
  ComboBox,
  ComboList,
  OptionSection,
  OptionGrid,
  ToppingGrid,
  ToppingContent,
  QuantityContainer,
  OrderSummary,
  SummaryContent,
  TotalPrice,
  ActionButtons,
  RecommendationsSection,
  RecommendationsGrid,
  LoadingContainer,
  LoadingContent,
  ErrorContainer,
  ErrorContent,
  OptionsButton,
  OptionsSummary,
  OptionTag,
  ComboHeader,
  ComboTitle,
  ComboIcon,
  ComboItemCard,
  ComboItemInfo,
  ComboItemNumber,
  ComboItemDetails,
  ComboItemName,
  ComboItemMeta,
} from "../components/styled components/StaffProductDetailStyles";

const { Title, Text, Paragraph } = Typography;
const { Group: RadioGroup } = Radio;

const ToppingItem = styled.div<{ selected: boolean }>`
  padding: 0.75rem !important;
  border-radius: 0.5rem !important;
  border: 1px solid ${(props) => (props.selected ? "#3b82f6" : "#e5e7eb")} !important;
  background-color: ${(props) =>
    props.selected ? "#eff6ff" : "white"} !important;
`;

interface ToppingApiResponse {
  data: {
    id: number;
    name: string;
    basePrice: number;
    productCode: string;
    imageUrl: string;
    description: string;
    productType: string;
    productUsage: string;
    status: string;
    createAt: string;
    updateAt: string | null;
    deleteAt: string | null;
    categoryId: number;
    categoryName: string;
  }[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

const noteOptions = [
  "Ít đường",
  "Không đường",
  "Ít đá",
  "Không đá",
  "Không bỏ topping",
  "Làm nóng",
  "Làm lạnh hơn",
  "Ít ngọt",
];

interface ProductDetail {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  isCombo: boolean;
  comboItems?: {
    productId: number;
    productName: string;
    size: string;
    quantity: number;
  }[];
  status: "active" | "inactive";
}

interface Topping {
  id: number;
  name: string;
  price: number;
}

interface ComboItemCustomization {
  productId: number;
  size: string;
  ice: string;
  toppings: number[];
  note: string[];
}

const StaffProductDetailScreen: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedIce, setSelectedIce] = useState<string>("100%");
  const [selectedToppings, setSelectedToppings] = useState<number[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [optionsModalVisible, setOptionsModalVisible] =
    useState<boolean>(false);
  const [comboItemCustomizations, setComboItemCustomizations] = useState<
    ComboItemCustomization[]
  >([]);
  const [currentComboItemIndex, setCurrentComboItemIndex] =
    useState<number>(-1);
  const [isAddingToOrder, setIsAddingToOrder] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  const getAuthAxios = () => {
    const accessToken = localStorage.getItem("accessToken");
    return axios.create({
      baseURL: "https://beautiful-unity-production.up.railway.app",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  };

  const sizeAdjustments = {
    S: -5000,
    M: 0,
    L: 5000,
    XL: 10000,
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const authAxios = getAuthAxios();

        // Check if user is authenticated
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          message.error("Bạn cần đăng nhập để xem thông tin sản phẩm");
          navigate("/");
          return;
        }

        const response = await authAxios.get(`/api/products/${productId}`);

        const productData = response.data;

        if (productData.productType === "COMBO") {
          const comboResponse = await authAxios.get(
            `/api/products/${productId}/combo`
          );
          const comboData = comboResponse.data;
          // Update to use itemsResponse instead of comboItems
          productData.comboItems = comboData.itemsResponse || [];
        }

        const transformedProduct: ProductDetail = {
          id: productData.id,
          name: productData.name,
          price: productData.basePrice,
          description: productData.description,
          image: productData.imageUrl,
          category: productData.categoryName,
          isCombo: productData.productType === "COMBO",
          comboItems: productData.comboItems,
          status: productData.status === "ACTIVE" ? "active" : "inactive",
        };

        setProduct(transformedProduct);

        const toppingsResponse = await authAxios.get<ToppingApiResponse>(
          "/api/products/filter?page=0&size=20&categoryName=Topping"
        );

        const toppingsData = toppingsResponse.data.data.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.basePrice,
        }));

        setToppings(toppingsData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching product details:", error);

        // Check if error is due to authentication
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userRole");
          navigate("/");
        } else {
          message.error("Không thể tải thông tin sản phẩm");
        }

        setLoading(false);
      }
    };
    if (productId) {
      fetchProductDetails();
    } else {
      message.error("Không tìm thấy thông tin sản phẩm");
      navigate("/staff/products");
    }
  }, [productId, navigate]);

  useEffect(() => {
    if (
      product?.isCombo &&
      product.comboItems &&
      product.comboItems.length > 0
    ) {
      const initialCustomizations = product.comboItems.map((item) => ({
        productId: item.productId,
        size: item.size || "M",
        ice: "100%",
        toppings: [],
        note: [],
      }));
      setComboItemCustomizations(initialCustomizations);
    }
  }, [product]);

  const showComboItemOptionsModal = (index: number) => {
    setCurrentComboItemIndex(index);
    setOptionsModalVisible(true);

    // Set the current selections based on the combo item's customization
    const customization = comboItemCustomizations[index];
    if (customization) {
      setSelectedSize(customization.size);
      setSelectedIce(customization.ice);
      setSelectedToppings(customization.toppings);
      setSelectedNotes(customization.note);
    }
  };

  const handleQuantityChange = (value: number | null) => {
    if (value !== null && value > 0) {
      setQuantity(value);
    }
  };

  const handleSizeChange = (e: RadioChangeEvent) => {
    setSelectedSize(e.target.value);
  };

  const handleIceChange = (e: RadioChangeEvent) => {
    setSelectedIce(e.target.value);
  };

  const handleToppingChange = (toppingId: number, checked: boolean) => {
    if (checked) {
      setSelectedToppings([...selectedToppings, toppingId]);
    } else {
      setSelectedToppings(selectedToppings.filter((id) => id !== toppingId));
    }
  };

  const handleNoteChange = (note: string) => {
    if (selectedNotes.includes(note)) {
      setSelectedNotes(selectedNotes.filter((n) => n !== note));
    } else {
      setSelectedNotes([...selectedNotes, note]);
    }
  };

  const calculateTotalPrice = (): number => {
    if (!product) return 0;

    if (!product.isCombo) {
      // Regular product price calculation (existing code)
      let total = product.price;
      total +=
        sizeAdjustments[selectedSize as keyof typeof sizeAdjustments] || 0;

      const toppingPrice = selectedToppings.reduce((sum, toppingId) => {
        const topping = toppings.find((t) => t.id === toppingId);
        return sum + (topping ? topping.price : 0);
      }, 0);

      total += toppingPrice;
      total *= quantity;
      return total;
    } else {
      // Combo price calculation
      let total = product.price;

      // Add additional costs for customizations
      comboItemCustomizations.forEach((customization, index) => {
        console.log(index);
        // Add size adjustments
        total +=
          sizeAdjustments[customization.size as keyof typeof sizeAdjustments] ||
          0;

        // Add topping prices
        const toppingPrice = customization.toppings.reduce((sum, toppingId) => {
          const topping = toppings.find((t) => t.id === toppingId);
          return sum + (topping ? topping.price : 0);
        }, 0);

        total += toppingPrice;
      });

      total *= quantity;
      return total;
    }
  };

  const handleAddToOrder = async () => {
    if (!product) return;

    try {
      setIsAddingToOrder(true);
      setOrderSuccess(false);
      const authAxios = getAuthAxios();

      // Prepare the request body based on whether it's a combo or regular product
      let requestBody;

      if (product.isCombo) {
        // For combo products - child items are the products in the combo
        const childItems = comboItemCustomizations.map(
          (customization, index) => {
            const comboItem = product.comboItems?.[index];
            return {
              productId: customization.productId,
              quantity: comboItem?.quantity || 1,
              size: customization.size,
              note: customization.note.join(", "),
              isCombo: false,
              childItems: [], // Combo items don't have their own child items
            };
          }
        );

        requestBody = {
          parentItems: [
            {
              productId: product.id,
              quantity: quantity,
              size: selectedSize,
              note: selectedNotes.join(", "),
              childItems: childItems,
              isCombo: true,
            },
          ],
        };
      } else {
        // For regular products - child items are the toppings
        const toppingItems = selectedToppings.map((toppingId) => {
          const topping = toppings.find((t) => t.id === toppingId);
          console.log(topping);
          return {
            productId: toppingId,
            quantity: 1,
            size: "NONE",
            note: "",
            isCombo: false,
            childItems: [],
          };
        });

        requestBody = {
          parentItems: [
            {
              productId: product.id,
              quantity: quantity,
              size: selectedSize,
              note: selectedNotes.join(", "),
              childItems: toppingItems,
              isCombo: false,
            },
          ],
        };
      }

      // Check if there's an existing order ID in localStorage
      const existingOrderId = localStorage.getItem("currentOrderId");
      let response;

      if (existingOrderId) {
        // If order ID exists, use PUT endpoint to update the order
        response = await authAxios.put(
          `/api/v2/orders/${existingOrderId}`,
          requestBody
        );
      } else {
        // If no order ID exists, create a new order with POST
        response = await authAxios.post("/api/v2/orders", requestBody);

        // Store the new order ID in localStorage
        if (response.data && response.data.id) {
          localStorage.setItem("currentOrderId", response.data.id.toString());
        }
      }

      console.log("Order response:", response.data);
      setOrderSuccess(true);
      message.success({
        content: existingOrderId
          ? "Đã cập nhật đơn hàng thành công!"
          : "Đã thêm vào đơn hàng thành công!",
        icon: <CheckCircleFilled style={{ color: "#52c41a" }} />,
      });
    } catch (error) {
      console.error("Error adding to order:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userRole");
          localStorage.removeItem("currentOrderId"); // Also remove the order ID
          navigate("/");
        } else {
          message.error(
            `Không thể thêm vào đơn hàng: ${
              error.response?.data?.message || "Đã xảy ra lỗi"
            }`
          );
        }
      } else {
        message.error("Không thể thêm vào đơn hàng. Vui lòng thử lại sau.");
      }
    } finally {
      setIsAddingToOrder(false);
      // Reset success state after 3 seconds
      if (orderSuccess) {
        setTimeout(() => {
          setOrderSuccess(false);
        }, 3000);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const showOptionsModal = () => {
    setOptionsModalVisible(true);
  };

  const handleOptionsModalCancel = () => {
    setOptionsModalVisible(false);
  };

  const handleOptionsModalOk = () => {
    if (product?.isCombo && currentComboItemIndex >= 0) {
      // Update the customization for the current combo item
      const updatedCustomizations = [...comboItemCustomizations];
      updatedCustomizations[currentComboItemIndex] = {
        ...updatedCustomizations[currentComboItemIndex],
        size: selectedSize,
        ice: selectedIce,
        toppings: selectedToppings,
        note: selectedNotes,
      };
      setComboItemCustomizations(updatedCustomizations);
    }
    setOptionsModalVisible(false);
  };

  const getSelectedToppingNames = () => {
    return selectedToppings
      .map((id) => toppings.find((t) => t.id === id)?.name)
      .filter(Boolean);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingContent>
          <Spin size="large" tip="Đang tải thông tin sản phẩm..." />
          <p className="mt-4 text-gray-500">Vui lòng đợi trong giây lát...</p>
        </LoadingContent>
      </LoadingContainer>
    );
  }

  if (!product) {
    return (
      <ErrorContainer>
        <ErrorContent>
          <InfoCircleOutlined style={{ fontSize: "48px", color: "#f5222d" }} />
          <Title level={3} className="mt-4">
            Không tìm thấy sản phẩm
          </Title>
          <Text className="block mb-6 text-gray-500">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </Text>
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/staff/products")}
            className="mt-4 bg-blue-500 hover:bg-blue-600"
            size="large"
          >
            Quay lại danh sách sản phẩm
          </Button>
        </ErrorContent>
      </ErrorContainer>
    );
  }

  return (
    <PageContainer>
      <BackButton
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/staff/products")}
        size="large"
      >
        Quay lại danh sách
      </BackButton>

      <ProductCard>
        <ProductContainer>
          <ImageSection>
            <ImageWrapper>
              <Badge.Ribbon
                text={product.isCombo ? "Combo" : "Đặc biệt"}
                color={product.isCombo ? "blue" : "green"}
                className={product.isCombo ? "" : "hidden"}
              >
                <Image
                  src={
                    product.image ||
                    "https://via.placeholder.com/300x300?text=No+Image"
                  }
                  alt={product.name}
                  className="rounded-lg object-cover shadow-md"
                  style={{ maxHeight: "400px", width: "100%" }}
                  fallback="https://via.placeholder.com/300x300?text=Image+Not+Available"
                  preview={true}
                />
              </Badge.Ribbon>
            </ImageWrapper>
          </ImageSection>

          <DetailsSection>
            <HeaderContainer>
              <ProductInfo>
                <Title level={2} className="text-3xl font-bold mb-1">
                  {product.name}
                </Title>
                <TagsContainer>
                  <Tag color="cyan" className="mr-2">
                    {product.category}
                  </Tag>
                  {product.status === "active" ? (
                    <Tag color="success">Đang bán</Tag>
                  ) : (
                    <Tag color="error">Ngừng bán</Tag>
                  )}
                </TagsContainer>
              </ProductInfo>
            </HeaderContainer>

            <DescriptionBox>
              <Paragraph className="text-base mb-0">
                {product.description}
              </Paragraph>
            </DescriptionBox>

            <PriceText>{formatCurrency(product.price)}</PriceText>

            {product.isCombo && product.comboItems && (
              <ComboBox>
                <ComboHeader>
                  <ComboTitle>
                    <ComboIcon>
                      <ShoppingCartOutlined />
                    </ComboIcon>
                    <Title level={4} className="mb-0">
                      Sản phẩm trong combo
                    </Title>
                  </ComboTitle>
                  <Tag color="blue" className="text-sm px-2 py-1">
                    {product.comboItems.length} món
                  </Tag>
                </ComboHeader>

                <ComboList>
                  {product.comboItems.map((item, index) => (
                    <ComboItemCard key={index}>
                      <ComboItemInfo>
                        <ComboItemNumber>{index + 1}</ComboItemNumber>
                        <ComboItemDetails>
                          <ComboItemName>{item.productName}</ComboItemName>
                          <ComboItemMeta>
                            <Tag color="blue" className="m-0">
                              Size{" "}
                              {comboItemCustomizations[index]?.size ||
                                item.size}
                            </Tag>
                            <Tag color="green" className="m-0">
                              x{item.quantity}
                            </Tag>
                            {comboItemCustomizations[index]?.toppings.length >
                              0 && (
                              <Tag color="purple" className="m-0">
                                {comboItemCustomizations[index].toppings.length}{" "}
                                topping
                              </Tag>
                            )}
                            {comboItemCustomizations[index]?.note.length >
                              0 && (
                              <Tag color="orange" className="m-0">
                                Có ghi chú
                              </Tag>
                            )}
                          </ComboItemMeta>
                        </ComboItemDetails>
                      </ComboItemInfo>
                      <Button
                        type="primary"
                        size="small"
                        icon={<SettingOutlined />}
                        onClick={() => showComboItemOptionsModal(index)}
                      >
                        Tùy chỉnh
                      </Button>
                    </ComboItemCard>
                  ))}
                </ComboList>
              </ComboBox>
            )}

            <Divider className="my-6" />

            <OptionsSummary>
              <div className="flex justify-between items-center mb-3">
                <Title level={4} className="mb-0">
                  {product.isCombo ? "Tùy chọn combo" : "Tùy chọn đã chọn"}
                </Title>
                {!product.isCombo && (
                  <OptionsButton
                    icon={<SettingOutlined />}
                    onClick={showOptionsModal}
                  >
                    Tùy chỉnh
                  </OptionsButton>
                )}
              </div>

              {product.isCombo ? (
                <div>
                  <Text strong>
                    Tùy chỉnh từng món trong combo bằng cách nhấn nút "Tùy
                    chỉnh" bên cạnh mỗi món.
                  </Text>

                  {comboItemCustomizations.length > 0 && (
                    <div className="mt-4">
                      <Title level={5} className="mb-2">
                        Chi tiết tùy chỉnh:
                      </Title>
                      {product.comboItems?.map((item, index) => {
                        const customization = comboItemCustomizations[index];
                        if (!customization) return null;

                        const hasToppings = customization.toppings.length > 0;
                        const hasNotes = customization.note.length > 0;
                        const hasCustomizations =
                          customization.size !== item.size ||
                          customization.ice !== "100%" ||
                          hasToppings ||
                          hasNotes;

                        if (!hasCustomizations) return null;

                        return (
                          <div
                            key={index}
                            className="mb-3 p-3 bg-gray-50 rounded-md"
                          >
                            <div className="flex justify-between">
                              <Text strong>{item.productName}</Text>
                              <Button
                                type="link"
                                size="small"
                                onClick={() => showComboItemOptionsModal(index)}
                                icon={<SettingOutlined />}
                              >
                                Sửa
                              </Button>
                            </div>

                            <div className="mt-1">
                              <div className="mb-1">
                                <Text strong className="text-sm">
                                  Kích cỡ:{" "}
                                </Text>
                                <OptionTag color="blue">
                                  {customization.size}
                                </OptionTag>
                              </div>

                              <div className="mb-1">
                                <Text strong className="text-sm">
                                  Đá:{" "}
                                </Text>
                                <OptionTag color="cyan">
                                  {customization.ice}
                                </OptionTag>
                              </div>

                              {hasToppings && (
                                <div className="mb-1">
                                  <Text strong className="text-sm">
                                    Topping:{" "}
                                  </Text>
                                  {customization.toppings.map(
                                    (toppingId, idx) => {
                                      const topping = toppings.find(
                                        (t) => t.id === toppingId
                                      );
                                      return topping ? (
                                        <OptionTag key={idx} color="purple">
                                          {topping.name}
                                        </OptionTag>
                                      ) : null;
                                    }
                                  )}
                                </div>
                              )}

                              {hasNotes && (
                                <div className="mb-1">
                                  <Text strong className="text-sm">
                                    Ghi chú:{" "}
                                  </Text>
                                  {customization.note.map((note, idx) => (
                                    <OptionTag key={idx} color="orange">
                                      {note}
                                    </OptionTag>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-3">
                    <Text strong>Tổng phụ phí: </Text>
                    <OptionTag color="red">
                      +
                      {formatCurrency(
                        calculateTotalPrice() - product.price * quantity
                      )}
                    </OptionTag>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-2">
                    <Text strong>Kích cỡ: </Text>
                    <OptionTag color="blue">{selectedSize}</OptionTag>
                  </div>

                  <div className="mb-2">
                    <Text strong>Đá: </Text>
                    <OptionTag color="cyan">{selectedIce}</OptionTag>
                  </div>

                  <div className="mb-2">
                    <Text strong>Topping: </Text>
                    {getSelectedToppingNames().length > 0 ? (
                      getSelectedToppingNames().map((name, index) => (
                        <OptionTag key={index} color="purple">
                          {name}
                        </OptionTag>
                      ))
                    ) : (
                      <OptionTag color="default">Không có</OptionTag>
                    )}
                  </div>

                  <div className="mb-2">
                    <Text strong>Ghi chú: </Text>
                    {selectedNotes.length > 0 ? (
                      selectedNotes.map((note, index) => (
                        <OptionTag key={index} color="orange">
                          {note}
                        </OptionTag>
                      ))
                    ) : (
                      <OptionTag color="default">Không có</OptionTag>
                    )}
                  </div>
                </div>
              )}
            </OptionsSummary>

            <div className="mb-6">
              <Title level={4} className="mb-3">
                Số lượng:
              </Title>
              <QuantityContainer>
                <Button
                  icon={<MinusOutlined />}
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="h-10 w-10 flex items-center justify-center"
                  size="large"
                />
                <InputNumber
                  min={1}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="mx-2 w-20 text-center"
                  size="large"
                  controls={false}
                />
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="h-10 w-10 flex items-center justify-center"
                  size="large"
                />
              </QuantityContainer>
            </div>

            <Divider className="my-6" />

            <OrderSummary>
              <SummaryContent>
                <TotalPrice>
                  <Text className="text-gray-500 block">Tổng tiền:</Text>
                  <div className="text-2xl font-bold text-red-500">
                    {formatCurrency(calculateTotalPrice())}
                  </div>
                </TotalPrice>
                <ActionButtons>
                  <Button
                    type="primary"
                    icon={
                      orderSuccess ? (
                        <CheckCircleFilled />
                      ) : (
                        <ShoppingCartOutlined />
                      )
                    }
                    size="large"
                    onClick={handleAddToOrder}
                    loading={isAddingToOrder}
                    className={`h-12 px-8 ${
                      orderSuccess
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                    disabled={isAddingToOrder || orderSuccess}
                  >
                    {isAddingToOrder
                      ? "Đang xử lý..."
                      : orderSuccess
                      ? "Đã thêm thành công"
                      : "Thêm vào đơn hàng"}
                  </Button>
                </ActionButtons>
              </SummaryContent>
            </OrderSummary>
          </DetailsSection>
        </ProductContainer>
      </ProductCard>

      <Modal
        title={
          product?.isCombo && currentComboItemIndex >= 0 && product.comboItems
            ? `Tùy chỉnh: ${product.comboItems[currentComboItemIndex].productName}`
            : "Tùy chỉnh đồ uống"
        }
        open={optionsModalVisible}
        onCancel={handleOptionsModalCancel}
        onOk={handleOptionsModalOk}
        width={700}
        footer={[
          <Button key="cancel" onClick={handleOptionsModalCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleOptionsModalOk}>
            Xác nhận
          </Button>,
        ]}
      >
        <div className="space-y-6">
          <OptionSection>
            <Title level={4} className="mb-3">
              Kích cỡ:
            </Title>
            <RadioGroup
              onChange={handleSizeChange}
              value={selectedSize}
              className="w-full"
            >
              <OptionGrid>
                <Radio.Button
                  value="S"
                  className="text-center h-10 flex items-center justify-center"
                >
                  S{" "}
                  {sizeAdjustments.S > 0
                    ? `+${formatCurrency(sizeAdjustments.S)}`
                    : formatCurrency(sizeAdjustments.S)}
                </Radio.Button>
                <Radio.Button
                  value="M"
                  className="text-center h-10 flex items-center justify-center"
                >
                  M (Tiêu chuẩn)
                </Radio.Button>
                <Radio.Button
                  value="L"
                  className="text-center h-10 flex items-center justify-center"
                >
                  L +{formatCurrency(sizeAdjustments.L)}
                </Radio.Button>
                <Radio.Button
                  value="XL"
                  className="text-center h-10 flex items-center justify-center"
                >
                  XL +{formatCurrency(sizeAdjustments.XL)}
                </Radio.Button>
              </OptionGrid>
            </RadioGroup>
          </OptionSection>

          <OptionSection>
            <Title level={4} className="mb-3">
              Đá:
            </Title>
            <RadioGroup
              onChange={handleIceChange}
              value={selectedIce}
              className="w-full"
            >
              <OptionGrid>
                <Radio.Button
                  value="0%"
                  className="text-center h-10 flex items-center justify-center"
                >
                  Không đá
                </Radio.Button>
                <Radio.Button
                  value="30%"
                  className="text-center h-10 flex items-center justify-center"
                >
                  Ít đá (30%)
                </Radio.Button>
                <Radio.Button
                  value="70%"
                  className="text-center h-10 flex items-center justify-center"
                >
                  Vừa đá (70%)
                </Radio.Button>
                <Radio.Button
                  value="100%"
                  className="text-center h-10 flex items-center justify-center"
                >
                  Nhiều đá (100%)
                </Radio.Button>
              </OptionGrid>
            </RadioGroup>
          </OptionSection>

          <OptionSection>
            <Title level={4} className="mb-3">
              Topping:
            </Title>
            <ToppingGrid>
              {toppings.map((topping) => (
                <ToppingItem
                  key={topping.id}
                  selected={selectedToppings.includes(topping.id)}
                >
                  <Checkbox
                    onChange={(e) =>
                      handleToppingChange(topping.id, e.target.checked)
                    }
                    checked={selectedToppings.includes(topping.id)}
                    className="w-full"
                  >
                    <ToppingContent>
                      <span className="font-medium">{topping.name}</span>
                      <div className="flex items-center">
                        <span className="text-red-500 font-medium">
                          +{formatCurrency(topping.price)}
                        </span>
                      </div>
                    </ToppingContent>
                  </Checkbox>
                </ToppingItem>
              ))}
            </ToppingGrid>
          </OptionSection>

          <OptionSection>
            <Title level={4} className="mb-3">
              Ghi chú:
            </Title>
            <Space size={[8, 16]} wrap>
              {noteOptions.map((note, index) => (
                <Tag
                  key={index}
                  color={selectedNotes.includes(note) ? "blue" : "default"}
                  style={{
                    padding: "6px 12px",
                    cursor: "pointer",
                    borderRadius: "16px",
                    fontSize: "14px",
                  }}
                  onClick={() => handleNoteChange(note)}
                >
                  {note}
                </Tag>
              ))}
            </Space>
          </OptionSection>
        </div>
      </Modal>

      <RecommendationsSection>
        <Title level={3} className="mb-4">
          Sản phẩm tương tự
        </Title>
        <RecommendationsGrid>
          {[1, 2, 3, 4].map((item) => (
            <Card
              key={item}
              hoverable
              className="shadow-sm hover:shadow-md transition-shadow duration-300"
              cover={
                <div className="h-40 bg-gray-100 flex items-center justify-center">
                  <Image
                    src="https://via.placeholder.com/150"
                    alt="Recommendation"
                    preview={false}
                    className="max-h-full"
                  />
                </div>
              }
            >
              <Card.Meta
                title="Sản phẩm gợi ý"
                description={
                  <div className="mt-2">
                    <div className="text-red-500 font-medium">
                      {formatCurrency(35000)}
                    </div>
                    <div className="flex items-center mt-1">
                      <StarFilled className="text-yellow-400 text-xs" />
                      <span className="text-xs ml-1">4.5</span>
                      <span className="text-gray-400 text-xs ml-2">
                        Đã bán 100+
                      </span>
                    </div>
                  </div>
                }
              />
            </Card>
          ))}
        </RecommendationsGrid>
      </RecommendationsSection>
    </PageContainer>
  );
};

export default StaffProductDetailScreen;
