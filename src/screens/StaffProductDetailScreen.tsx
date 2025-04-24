import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Image, Typography, Divider, Checkbox, Radio, InputNumber, Spin, message, Tag,Modal,RadioChangeEvent,Badge,Space} from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined, PlusOutlined, MinusOutlined,StarFilled,InfoCircleOutlined,CheckCircleFilled,SettingOutlined} from '@ant-design/icons';
import styled from 'styled-components';
import axios from 'axios';
import {PageContainer,BackButton,ProductCard,ProductContainer,ImageSection,ImageWrapper,DetailsSection,
HeaderContainer,ProductInfo,TagsContainer,DescriptionBox,PriceText,ComboBox,ComboList,ComboItem, OptionSection, OptionGrid, ToppingGrid, ToppingContent, QuantityContainer, OrderSummary, SummaryContent, TotalPrice, ActionButtons, RecommendationsSection, RecommendationsGrid, LoadingContainer, LoadingContent, ErrorContainer, ErrorContent, OptionsButton, OptionsSummary, OptionTag
} from '../components/styled components/StaffProductDetailStyles'

const { Title, Text, Paragraph } = Typography;
const { Group: RadioGroup } = Radio;

const ToppingItem = styled.div<{ selected: boolean }>`
  padding: 0.75rem !important;
  border-radius: 0.5rem !important;
  border: 1px solid ${props => props.selected ? '#3b82f6' : '#e5e7eb'} !important;
  background-color: ${props => props.selected ? '#eff6ff' : 'white'} !important;
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
  "Ít ngọt"
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
  status: 'active' | 'inactive';
}

interface Topping {
  id: number;
  name: string;
  price: number;
}

interface OrderItem {
  productId: number;
  quantity: number;
  size: string;
  ice: string;
  toppings: number[];
  note: string[];
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
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [optionsModalVisible, setOptionsModalVisible] = useState<boolean>(false);
  
  const sizeAdjustments = {
    'S': -5000,
    'M': 0,
    'L': 5000,
    'XL': 10000
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://beautiful-unity-production.up.railway.app/api/products/${productId}`);
  
        const productData = response.data;
  
        if (productData.productType === "COMBO") {
          const comboResponse = await axios.get(
            `https://beautiful-unity-production.up.railway.app/api/products/${productId}/combo`
          );
          const comboData = comboResponse.data;
          productData.comboItems = comboData.comboItems || [];
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
          status: productData.status === "ACTIVE" ? 'active' : 'inactive',
        };
        
        setProduct(transformedProduct);
  
        const toppingsResponse = await axios.get<ToppingApiResponse>(
          'https://beautiful-unity-production.up.railway.app/api/products/filter?page=0&size=20&categoryName=Topping'
        );
        
        const toppingsData = toppingsResponse.data.data.map(item => ({
          id: item.id,
          name: item.name,
          price: item.basePrice,
        }));
        
        setToppings(toppingsData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product details:", error);
        message.error("Không thể tải thông tin sản phẩm");
        setLoading(false);
      }
    };
    if (productId) {
      fetchProductDetails();
    } else {
      message.error("Không tìm thấy thông tin sản phẩm");
      navigate('/staff/products');
    }
  }, [productId, navigate]);
  
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

  const handleNoteChange = (note: string) => {
    if (selectedNotes.includes(note)) {
      setSelectedNotes(selectedNotes.filter(n => n !== note));
    } else {
      setSelectedNotes([...selectedNotes, note]);
    }
  };
  
  const calculateTotalPrice = (): number => {
    if (!product) return 0;
    
    let total = product.price;
    total += sizeAdjustments[selectedSize as keyof typeof sizeAdjustments] || 0;

    const toppingPrice = selectedToppings.reduce((sum, toppingId) => {
      const topping = toppings.find(t => t.id === toppingId);
      return sum + (topping ? topping.price : 0);
    }, 0);
    
    total += toppingPrice;
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
      note: selectedNotes,
      totalPrice: calculateTotalPrice()
    };

    console.log('Order item:', orderItem);
    message.success({
      content: 'Đã thêm vào đơn hàng thành công!',
      icon: <CheckCircleFilled style={{ color: '#52c41a' }} />
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const showOptionsModal = () => {
    setOptionsModalVisible(true);
  };

  const handleOptionsModalCancel = () => {
    setOptionsModalVisible(false);
  };

  const handleOptionsModalOk = () => {
    setOptionsModalVisible(false);
  };

  const getSelectedToppingNames = () => {
    return selectedToppings
      .map(id => toppings.find(t => t.id === id)?.name)
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
          </ImageSection>

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

            <OptionsSummary>
              <div className="flex justify-between items-center mb-3">
                <Title level={4} className="mb-0">Tùy chọn đã chọn</Title>
                <OptionsButton 
                  icon={<SettingOutlined />} 
                  onClick={showOptionsModal}
                >
                  Tùy chỉnh
                </OptionsButton>
              </div>
              
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
                      <OptionTag key={index} color="purple">{name}</OptionTag>
                    ))
                  ) : (
                    <OptionTag color="default">Không có</OptionTag>
                  )}
                </div>
                
                <div className="mb-2">
                  <Text strong>Ghi chú: </Text>
                  {selectedNotes.length > 0 ? (
                    selectedNotes.map((note, index) => (
                      <OptionTag key={index} color="orange">{note}</OptionTag>
                    ))
                  ) : (
                    <OptionTag color="default">Không có</OptionTag>
                  )}
                </div>
              </div>
            </OptionsSummary>

            <div className="mb-6">
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
                    icon={<ShoppingCartOutlined />} 
                    size="large"
                    onClick={handleAddToOrder}
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

      <Modal
        title="Tùy chỉnh đồ uống"
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
                >
                  <Checkbox 
                    onChange={(e) => handleToppingChange(topping.id, e.target.checked)}
                    checked={selectedToppings.includes(topping.id)}
                    className="w-full"
                  >
                    <ToppingContent>
                      <span className="font-medium">{topping.name}</span>
                      <div className="flex items-center">
                        <span className="text-red-500 font-medium">+{formatCurrency(topping.price)}</span>      
                      </div>
                    </ToppingContent>
                  </Checkbox>
                </ToppingItem>
              ))}
            </ToppingGrid>
          </OptionSection>
          
          <OptionSection>
            <Title level={4} className="mb-3">Ghi chú:</Title>
            <Space size={[8, 16]} wrap>
              {noteOptions.map((note, index) => (
                <Tag
                  key={index}
                  color={selectedNotes.includes(note) ? 'blue' : 'default'}
                  style={{ 
                    padding: '6px 12px', 
                    cursor: 'pointer',
                    borderRadius: '16px',
                    fontSize: '14px'
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
        <Title level={3} className="mb-4">Sản phẩm tương tự</Title>
        <RecommendationsGrid>
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
