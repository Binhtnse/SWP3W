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
  HeartOutlined,
  StarFilled,
  InfoCircleOutlined,
  CheckCircleFilled
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Group: RadioGroup } = Radio;
const { TextArea } = Input;

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
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <Spin size="large" tip="Đang tải thông tin sản phẩm..." />
          <p className="mt-4 text-gray-500">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
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
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/staff/products')}
        className="mb-6 hover:bg-gray-100 border-gray-300 shadow-sm"
        size="large"
      >
        Quay lại danh sách
      </Button>
      
      <Card className="shadow-lg rounded-xl overflow-hidden border-0">
        <div className="flex flex-col md:flex-row">
          {/* Product Image Section */}
          <div className="md:w-2/5 p-4 bg-gray-50 flex flex-col justify-center items-center">
            <div className="relative w-full">
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
            </div>
            
            {/* Product stats */}
            <div className="mt-4 w-full bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <StarFilled className="text-yellow-400 mr-1" />
                  <span className="font-medium">{product.rating || 4.5}</span>
                  <span className="text-gray-500 ml-1">({product.soldCount || 0} đã bán)</span>
                </div>
                <Tag 
                  color={product.remainingAmount > 10 ? 'green' : product.remainingAmount > 0 ? 'orange' : 'red'}
                  className="text-sm px-2 py-1"
                >
                  {product.remainingAmount > 0 
                    ? `Còn lại: ${product.remainingAmount}` 
                    : 'Hết hàng'}
                </Tag>
              </div>
            </div>
          </div>
          
          {/* Product Details */}
          <div className="md:w-3/5 p-6">
            <div className="flex justify-between items-start">
              <div>
                <Title level={2} className="text-3xl font-bold mb-1">{product.name}</Title>
                <div className="flex items-center mb-2">
                  <Tag color="cyan" className="mr-2">{product.category}</Tag>
                  {product.status === 'active' ? (
                    <Tag color="success">Đang bán</Tag>
                  ) : (
                    <Tag color="error">Ngừng bán</Tag>
                  )}
                </div>
              </div>
              <Button 
                icon={<HeartOutlined />} 
                shape="circle" 
                size="large"
                className="flex items-center justify-center border-gray-300 hover:text-red-500 hover:border-red-500"
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <Paragraph className="text-base mb-0">
                {product.description}
              </Paragraph>
            </div>
            
            <div className="text-2xl font-bold mb-4 text-red-500">
              {formatCurrency(product.price)}
            </div>
            
            {product.isCombo && product.comboItems && (
              <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                <Title level={4} className="mb-2 flex items-center">
                  <span className="mr-2">Sản phẩm trong combo</span>
                </Title>
                <ul className="list-none pl-0">
                  {product.comboItems.map((item, index) => (
                    <li key={index} className="mb-2 flex items-center">
                      <CheckCircleFilled className="text-blue-500 mr-2" />
                      <span className="font-medium">{item.name}</span>
                      <Tag className="ml-2 bg-blue-100 text-blue-800 border-0">x{item.quantity}</Tag>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Divider className="my-6" />
            
            {/* Order Options */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Title level={4} className="mb-3">Kích cỡ:</Title>
                <RadioGroup onChange={handleSizeChange} value={selectedSize} className="w-full">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                  </div>
                </RadioGroup>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <Title level={4} className="mb-3">Đá:</Title>
                <RadioGroup onChange={handleIceChange} value={selectedIce} className="w-full">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                  </div>
                </RadioGroup>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <Title level={4} className="mb-3">Topping:</Title>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {toppings.map(topping => (
                    <div 
                      key={topping.id} 
                      className={`p-3 rounded-lg border ${
                        selectedToppings.includes(topping.id) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-white'
                      } ${topping.remainingAmount <= 0 ? 'opacity-60' : ''}`}
                    >
                      <Checkbox 
                        onChange={(e) => handleToppingChange(topping.id, e.target.checked)}
                        disabled={topping.remainingAmount <= 0}
                        checked={selectedToppings.includes(topping.id)}
                        className="w-full"
                      >
                        <div className="flex justify-between items-center">
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
                        </div>
                      </Checkbox>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
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
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <Title level={4} className="mb-3">Số lượng:</Title>
                <div className="flex items-center">
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
                </div>
              </div>
            </div>
            
            <Divider className="my-6" />
            
            <div className="sticky bottom-0 bg-white p-4 rounded-lg shadow-lg border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <Text className="text-gray-500 block">Tổng tiền:</Text>
                  <div className="text-2xl font-bold text-red-500">
                    {formatCurrency(calculateTotalPrice())}
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    size="large"
                    icon={<HeartOutlined />}
                    className="border-gray-300 hover:text-red-500 hover:border-red-500"
                  >
                    Lưu
                  </Button>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Recommendations Section */}
      <div className="mt-8">
        <Title level={3} className="mb-4">Sản phẩm tương tự</Title>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </div>
      </div>
    </div>
  );
};

export default StaffProductDetailScreen;
