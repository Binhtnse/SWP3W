import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Input,
  RadioChangeEvent,
  Badge
} from 'antd';
import { 
  ArrowLeftOutlined, 
  ShoppingCartOutlined, 
  PlusOutlined, 
  MinusOutlined,
  StarFilled,
  InfoCircleOutlined,
  CheckCircleFilled
} from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { Group: RadioGroup } = Radio;
const { TextArea } = Input;

const PageContainer = styled.div`
  padding: 1.5rem !important;
  background-color: #f9fafb !important;
  min-height: 100vh !important;
`;

const BackButton = styled(Button)`
  margin-bottom: 1.5rem !important;
  &:hover {
    background-color: #f3f4f6 !important;
  }
  border-color: #d1d5db !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
`;

const ProductCard = styled(Card)`
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  border-radius: 0.75rem !important;
  overflow: hidden !important;
  border: 0 !important;
`;

const ProductContainer = styled.div`
  display: flex !important;
  flex-direction: column !important;
  
  @media (min-width: 768px) {
    flex-direction: row !important;
  }
`;

const ImageSection = styled.div`
  width: 100% !important;
  padding: 1rem !important;
  background-color: #f9fafb !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  
  @media (min-width: 768px) {
    width: 40% !important;
  }
`;

const ImageWrapper = styled.div`
  position: relative !important;
  width: 100% !important;
`;

const ProductStats = styled.div`
  margin-top: 1rem !important;
  width: 100% !important;
  background-color: white !important;
  padding: 1rem !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid #f0f0f0 !important;
  transition: all 0.3s ease !important;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
    transform: translateY(-2px) !important;
  }
`;

const StatsContent = styled.div`
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
`;

const RatingContainer = styled.div`
  display: flex !important;
  align-items: center !important;
`;

const DetailsSection = styled.div`
  width: 100% !important;
  padding: 1.5rem !important;
  background-color: #ffffff !important;
  border-radius: 0 0.75rem 0.75rem 0 !important;
  position: relative !important;
  
  @media (min-width: 768px) {
    width: 60% !important;
    border-left: 1px solid #f0f0f0 !important;
  }
  
  @media (max-width: 767px) {
    border-top: 1px solid #f0f0f0 !important;
    border-radius: 0 0 0.75rem 0.75rem !important;
  }
`;

const HeaderContainer = styled.div`
  display: flex !important;
  justify-content: space-between !important;
  align-items: flex-start !important;
`;

const ProductInfo = styled.div``;

const TagsContainer = styled.div`
  display: flex !important;
  align-items: center !important;
  margin-bottom: 0.5rem !important;
`;

const DescriptionBox = styled.div`
  background-color: #f9fafb !important;
  padding: 1.25rem !important;
  border-radius: 0.5rem !important;
  margin-bottom: 1.25rem !important;
  border: 1px solid #e5e7eb !important;
  position: relative !important;
  overflow: hidden !important;
  
  &::before {
    content: "" !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    height: 100% !important;
    width: 4px !important;
    background-color: #3b82f6 !important;
  }
  
  &:hover {
    background-color: #f3f4f6 !important;
  }
`;

const PriceText = styled.div`
  font-size: 1.75rem !important;
  font-weight: 700 !important;
  margin-bottom: 1.25rem !important;
  color: #ef4444 !important;
  display: inline-block !important;
  position: relative !important;
  padding: 0.25rem 0.5rem !important;
  
  &::after {
    content: "" !important;
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 8px !important;
    background-color: rgba(239, 68, 68, 0.2) !important;
    z-index: -1 !important;
    border-radius: 4px !important;
  }
  
  @media (min-width: 768px) {
    font-size: 2rem !important;
  }
`;

const ComboBox = styled.div`
  margin-bottom: 1rem !important;
  background-color: #eff6ff !important;
  padding: 1rem !important;
  border-radius: 0.5rem !important;
`;

const ComboList = styled.ul`
  list-style: none !important;
  padding-left: 0 !important;
`;

const ComboItem = styled.li`
  margin-bottom: 0.5rem !important;
  display: flex !important;
  align-items: center !important;
`;

const OptionSection = styled.div`
  background-color: #f9fafb !important;
  padding: 1rem !important;
  border-radius: 0.5rem !important;
  margin-bottom: 1.5rem !important;
`;

const OptionGrid = styled.div`
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 0.5rem !important;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr) !important;
  }
`;

const ToppingGrid = styled.div`
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 0.75rem !important;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr) !important;
  }
`;

const ToppingItem = styled.div<{ selected: boolean, available: boolean }>`
  padding: 0.75rem !important;
  border-radius: 0.5rem !important;
  border: 1px solid ${props => props.selected ? '#3b82f6' : '#e5e7eb'} !important;
  background-color: ${props => props.selected ? '#eff6ff' : 'white'} !important;
  opacity: ${props => props.available ? '1' : '0.6'} !important;
`;

const ToppingContent = styled.div`
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
`;

const QuantityContainer = styled.div`
  display: flex !important;
  align-items: center !important;
`;

const OrderSummary = styled.div`
  position: sticky !important;
  bottom: 0 !important;
  background-color: white !important;
  padding: 1rem !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  border: 1px solid #f3f4f6 !important;
`;

const SummaryContent = styled.div`
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  align-items: center !important;
  
  @media (min-width: 768px) {
    flex-direction: row !important;
  }
`;

const TotalPrice = styled.div`
  margin-bottom: 1rem !important;
  
  @media (min-width: 768px) {
    margin-bottom: 0 !important;
  }
`;

const ActionButtons = styled.div`
  display: flex !important;
  gap: 0.75rem !important;
`;

const RecommendationsSection = styled.div`
  margin-top: 2rem !important;
`;

const RecommendationsGrid = styled.div`
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 1rem !important;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr) !important;
  }
`;

const LoadingContainer = styled.div`
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  height: 100vh !important;
  background-color: #f9fafb !important;
`;

const LoadingContent = styled.div`
  text-align: center !important;
  padding: 2rem !important;
  background-color: white !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
`;

const ErrorContainer = styled.div`
  padding: 2rem !important;
  text-align: center !important;
  background-color: #f9fafb !important;
  min-height: 100vh !important;
`;

const ErrorContent = styled.div`
  background-color: white !important;
  padding: 2rem !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  max-width: 28rem !important;
  margin: 0 auto !important;
`;

// Mock data for product
const mockProduct = {
  id: 1,
  name: "Trà sữa truyền thống",
  price: 35000,
  description: "Trà sữa truyền thống với hương vị đậm đà, thơm ngon, là sự kết hợp hoàn hảo giữa trà đen và sữa tươi.",
  image: "https://example.com/trasua.jpg", // Replace with actual image URL or local path
  category: "Trà sữa",
  isCombo: false,
  remainingAmount: 50,
  status: 'active' as 'active' | 'inactive',
  rating: 4.8,
  soldCount: 120
};

// Mock data for combo product
const mockComboProduct = {
  id: 2,
  name: "Combo Trà sữa đôi",
  price: 65000,
  description: "Combo gồm 2 ly trà sữa truyền thống và 1 phần bánh pudding.",
  image: "https://example.com/combo.jpg", // Replace with actual image URL or local path
  category: "Combo",
  isCombo: true,
  comboItems: [
    { name: "Trà sữa truyền thống", quantity: 2 },
    { name: "Bánh pudding", quantity: 1 }
  ],
  remainingAmount: 20,
  status: 'active' as 'active' | 'inactive',
  rating: 4.5,
  soldCount: 85
};

// Mock data for toppings
const mockToppings = [
  { id: 1, name: "Trân châu đen", price: 5000, remainingAmount: 100 },
  { id: 2, name: "Trân châu trắng", price: 5000, remainingAmount: 80 },
  { id: 3, name: "Pudding", price: 8000, remainingAmount: 50 },
  { id: 4, name: "Thạch trái cây", price: 7000, remainingAmount: 0 },
  { id: 5, name: "Kem cheese", price: 10000, remainingAmount: 30 }
];

interface ProductDetail {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  isCombo: boolean;
  comboItems?: { name: string; quantity: number }[];
  remainingAmount: number;
  status: 'active' | 'inactive';
  rating?: number;
  soldCount?: number;
}

interface Topping {
  id: number;
  name: string;
  price: number;
  remainingAmount: number;
}

interface OrderItem {
  productId: number;
  quantity: number;
  size: string;
  ice: string;
  toppings: number[];
  note: string;
  totalPrice: number;
}

const StaffProductDetailScreen: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedIce, setSelectedIce] = useState<string>('100%');
  const [selectedToppings, setSelectedToppings] = useState<number[]>([]);
  const [note, setNote] = useState<string>('');
  
  // Price adjustments based on size
  const sizeAdjustments = {
    'S': -5000,
    'M': 0,
    'L': 5000,
    'XL': 10000
  };

  useEffect(() => {
    // Simulate API loading delay
    const timer = setTimeout(() => {
      // Use mock data instead of API calls
      const selectedProduct = parseInt(productId || '1') === 2 ? mockComboProduct : mockProduct;
      setProduct(selectedProduct);
      setToppings(mockToppings);
      setLoading(false);
    }, 800); // Simulate loading delay
    
    return () => clearTimeout(timer);
  }, [productId]);
  
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
      setSelectedToppings(selectedToppings.filter(id => id !== toppingId));
    }
  };
  
  const calculateTotalPrice = (): number => {
    if (!product) return 0;
    
    // Base price
    let total = product.price;
    
    // Add size adjustment
    total += sizeAdjustments[selectedSize as keyof typeof sizeAdjustments] || 0;
    
    // Add toppings
    const toppingPrice = selectedToppings.reduce((sum, toppingId) => {
      const topping = toppings.find(t => t.id === toppingId);
      return sum + (topping ? topping.price : 0);
    }, 0);
    
    total += toppingPrice;
    
    // Multiply by quantity
    total *= quantity;
    
    return total;
  };
  
  const handleAddToOrder = () => {
    if (!product) return;
    
    const orderItem: OrderItem = {
      productId: product.id,
      quantity,
      size: selectedSize,
      ice: selectedIce,
      toppings: selectedToppings,
      note,
      totalPrice: calculateTotalPrice()
    };
    
    // Here you would typically add this to a cart or order state
    // For now, we'll just show a success message
    console.log('Order item:', orderItem);
    message.success({
      content: 'Đã thêm vào đơn hàng thành công!',
      icon: <CheckCircleFilled style={{ color: '#52c41a' }} />
    });
    
    // Navigate back to product list or to cart
    // navigate('/staff/cart');
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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
          <InfoCircleOutlined style={{ fontSize: '48px', color: '#f5222d' }} />
          <Title level={3} className="mt-4">Không tìm thấy sản phẩm</Title>
          <Text className="block mb-6 text-gray-500">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</Text>
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/staff/products')}
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
        onClick={() => navigate('/staff/products')}
        size="large"
      >
        Quay lại danh sách
      </BackButton>
      
      <ProductCard>
        <ProductContainer>
          {/* Product Image Section */}
          <ImageSection>
            <ImageWrapper>
              <Badge.Ribbon 
                text={product.isCombo ? 'Combo' : 'Đặc biệt'} 
                color={product.isCombo ? 'blue' : 'green'}
                className={product.isCombo ? '' : 'hidden'}
              >
                <Image
                  src={product.image || "https://via.placeholder.com/300x300?text=No+Image"}
                  alt={product.name}
                  className="rounded-lg object-cover shadow-md"
                  style={{ maxHeight: '400px', width: '100%' }}
                  fallback="https://via.placeholder.com/300x300?text=Image+Not+Available"
                  preview={true}
                />
              </Badge.Ribbon>
            </ImageWrapper>
            
            {/* Product stats */}
            <ProductStats>
              <StatsContent>
                <RatingContainer>
                  <StarFilled className="text-yellow-400 mr-1" />
                  <span className="font-medium">{product.rating || 4.5}</span>
                  <span className="text-gray-500 ml-1">({product.soldCount || 0} đã bán)</span>
                </RatingContainer>
                <Tag 
                  color={product.remainingAmount > 10 ? 'green' : product.remainingAmount > 0 ? 'orange' : 'red'}
                  className="text-sm px-2 py-1"
                >
                  {product.remainingAmount > 0 
                    ? `Còn lại: ${product.remainingAmount}` 
                    : 'Hết hàng'}
                </Tag>
              </StatsContent>
            </ProductStats>
          </ImageSection>
          
          {/* Product Details */}
          <DetailsSection>
            <HeaderContainer>
              <ProductInfo>
                <Title level={2} className="text-3xl font-bold mb-1">{product.name}</Title>
                <TagsContainer>
                  <Tag color="cyan" className="mr-2">{product.category}</Tag>
                  {product.status === 'active' ? (
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
            
            <PriceText>
              {formatCurrency(product.price)}
            </PriceText>
            
            {product.isCombo && product.comboItems && (
              <ComboBox>
                <Title level={4} className="mb-2 flex items-center">
                  <span className="mr-2">Sản phẩm trong combo</span>
                </Title>
                <ComboList>
                  {product.comboItems.map((item, index) => (
                    <ComboItem key={index}>
                      <CheckCircleFilled className="text-blue-500 mr-2" />
                      <span className="font-medium">{item.name}</span>
                      <Tag className="ml-2 bg-blue-100 text-blue-800 border-0">x{item.quantity}</Tag>
                    </ComboItem>
                  ))}
                </ComboList>
              </ComboBox>
            )}
            
            <Divider className="my-6" />
            
            {/* Order Options */}
            <div className="space-y-6">
              <OptionSection>
                <Title level={4} className="mb-3">Kích cỡ:</Title>
                <RadioGroup onChange={handleSizeChange} value={selectedSize} className="w-full">
                  <OptionGrid>
                    <Radio.Button value="S" className="text-center h-10 flex items-center justify-center">
                      S {sizeAdjustments.S > 0 ? `+${formatCurrency(sizeAdjustments.S)}` : formatCurrency(sizeAdjustments.S)}
                    </Radio.Button>
                    <Radio.Button value="M" className="text-center h-10 flex items-center justify-center">
                      M (Tiêu chuẩn)
                    </Radio.Button>
                    <Radio.Button value="L" className="text-center h-10 flex items-center justify-center">
                      L +{formatCurrency(sizeAdjustments.L)}
                    </Radio.Button>
                    <Radio.Button value="XL" className="text-center h-10 flex items-center justify-center">
                      XL +{formatCurrency(sizeAdjustments.XL)}
                    </Radio.Button>
                  </OptionGrid>
                </RadioGroup>
              </OptionSection>
              
              <OptionSection>
                <Title level={4} className="mb-3">Đá:</Title>
                <RadioGroup onChange={handleIceChange} value={selectedIce} className="w-full">
                  <OptionGrid>
                    <Radio.Button value="0%" className="text-center h-10 flex items-center justify-center">
                      Không đá
                    </Radio.Button>
                    <Radio.Button value="30%" className="text-center h-10 flex items-center justify-center">
                      Ít đá (30%)
                    </Radio.Button>
                    <Radio.Button value="70%" className="text-center h-10 flex items-center justify-center">
                      Vừa đá (70%)
                    </Radio.Button>
                    <Radio.Button value="100%" className="text-center h-10 flex items-center justify-center">
                      Nhiều đá (100%)
                    </Radio.Button>
                  </OptionGrid>
                </RadioGroup>
              </OptionSection>
              
              <OptionSection>
                <Title level={4} className="mb-3">Topping:</Title>
                <ToppingGrid>
                  {toppings.map(topping => (
                    <ToppingItem 
                      key={topping.id} 
                      selected={selectedToppings.includes(topping.id)}
                      available={topping.remainingAmount > 0}
                    >
                      <Checkbox 
                        onChange={(e) => handleToppingChange(topping.id, e.target.checked)}
                        disabled={topping.remainingAmount <= 0}
                        checked={selectedToppings.includes(topping.id)}
                        className="w-full"
                      >
                        <ToppingContent>
                          <span className="font-medium">{topping.name}</span>
                          <div className="flex items-center">
                            <span className="text-red-500 font-medium">+{formatCurrency(topping.price)}</span>
                            {topping.remainingAmount <= 0 && (
                              <Tag color="red" className="ml-2">Hết</Tag>
                            )}
                            {topping.remainingAmount > 0 && topping.remainingAmount <= 10 && (
                              <Tag color="orange" className="ml-2">Sắp hết</Tag>
                            )}
                          </div>
                        </ToppingContent>
                      </Checkbox>
                    </ToppingItem>
                  ))}
                </ToppingGrid>
              </OptionSection>
              
              <OptionSection>
                <Title level={4} className="mb-3">Ghi chú:</Title>
                <TextArea 
                  rows={3} 
                  placeholder="Ghi chú thêm cho món này (ví dụ: ít đường, không bỏ đá...)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full"
                  maxLength={200}
                  showCount
                />
              </OptionSection>
              
              <OptionSection>
                <Title level={4} className="mb-3">Số lượng:</Title>
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
                    max={product.remainingAmount}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="mx-2 w-20 text-center"
                    size="large"
                    controls={false}
                  />
                  <Button 
                    icon={<PlusOutlined />} 
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.remainingAmount}
                    className="h-10 w-10 flex items-center justify-center"
                    size="large"
                  />
                  <Text className="ml-4 text-gray-500">
                    Còn lại: {product.remainingAmount}
                  </Text>
                </QuantityContainer>
              </OptionSection>
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
                    icon={<ShoppingCartOutlined />} 
                    size="large"
                    onClick={handleAddToOrder}
                    disabled={product.remainingAmount <= 0}
                    className="bg-green-500 hover:bg-green-600 h-12 px-8"
                  >
                    Thêm vào đơn hàng
                  </Button>
                </ActionButtons>
              </SummaryContent>
            </OrderSummary>
          </DetailsSection>
        </ProductContainer>
      </ProductCard>
      
      {/* Recommendations Section */}
      <RecommendationsSection>
        <Title level={3} className="mb-4">Sản phẩm tương tự</Title>
        <RecommendationsGrid>
          {/* This would be populated with actual recommendation data */}
          {[1, 2, 3, 4].map(item => (
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
                    <div className="text-red-500 font-medium">{formatCurrency(35000)}</div>
                    <div className="flex items-center mt-1">
                      <StarFilled className="text-yellow-400 text-xs" />
                      <span className="text-xs ml-1">4.5</span>
                      <span className="text-gray-400 text-xs ml-2">Đã bán 100+</span>
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
