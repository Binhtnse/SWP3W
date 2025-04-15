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
  Space, 
  Spin, 
  message, 
  Tag,
  Input,
  RadioChangeEvent
} from 'antd';
import { 
  ArrowLeftOutlined, 
  ShoppingCartOutlined, 
  PlusOutlined, 
  MinusOutlined 
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
  status: 'active' as 'active' | 'inactive'
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
  status: 'active' as 'active' | 'inactive'
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
    message.success('Đã thêm vào đơn hàng');
    
    // Navigate back to product list or to cart
    // navigate('/staff/cart');
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="p-6 text-center">
        <Title level={3}>Không tìm thấy sản phẩm</Title>
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/staff/products')}
          className="mt-4 bg-blue-500"
        >
          Quay lại danh sách sản phẩm
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/staff/products')}
        className="mb-4"
      >
        Quay lại danh sách
      </Button>
      
      <Card className="shadow-md">
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="md:w-1/3 p-4 flex justify-center">
            <Image
              src={product.image || "https://via.placeholder.com/300x300?text=No+Image"}
              alt={product.name}
              className="rounded-lg object-cover"
              style={{ maxHeight: '300px' }}
              fallback="https://via.placeholder.com/300x300?text=Image+Not+Available"
            />
          </div>
          
          {/* Product Details */}
          <div className="md:w-2/3 p-4">
            <div className="flex justify-between items-start">
              <div>
                <Title level={2}>{product.name}</Title>
                {product.isCombo && (
                  <Tag color="blue" className="mb-2">Combo</Tag>
                )}
                <Text className="text-lg text-gray-600 block mb-2">
                  {product.category}
                </Text>
              </div>
              <div>
                <Tag 
                  color={product.remainingAmount > 10 ? 'green' : product.remainingAmount > 0 ? 'orange' : 'red'}
                  className="text-base px-3 py-1"
                >
                  {product.remainingAmount > 0 
                    ? `Còn lại: ${product.remainingAmount}` 
                    : 'Hết hàng'}
                </Tag>
              </div>
            </div>
            
            <Paragraph className="text-base mt-2 mb-4">
              {product.description}
            </Paragraph>
            
            <div className="text-xl font-semibold mb-4">
              Giá: {formatCurrency(product.price)}
            </div>
            
            {product.isCombo && product.comboItems && (
              <div className="mb-4">
                <Title level={4}>Sản phẩm trong combo:</Title>
                <ul className="list-disc pl-5">
                  {product.comboItems.map((item, index) => (
                    <li key={index} className="mb-1">
                      {item.name} x {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Divider />
            
            {/* Order Options */}
            <div className="mb-4">
              <Title level={4}>Kích cỡ:</Title>
              <RadioGroup onChange={handleSizeChange} value={selectedSize}>
                <Space direction="horizontal">
                  <Radio value="S">S {sizeAdjustments.S > 0 ? `+${formatCurrency(sizeAdjustments.S)}` : formatCurrency(sizeAdjustments.S)}</Radio>
                  <Radio value="M">M (Tiêu chuẩn)</Radio>
                  <Radio value="L">L +{formatCurrency(sizeAdjustments.L)}</Radio>
                  <Radio value="XL">XL +{formatCurrency(sizeAdjustments.XL)}</Radio>
                </Space>
              </RadioGroup>
            </div>
            
            <div className="mb-4">
              <Title level={4}>Đá:</Title>
              <RadioGroup onChange={handleIceChange} value={selectedIce}>
                <Space direction="horizontal">
                  <Radio value="0%">Không đá</Radio>
                  <Radio value="30%">Ít đá (30%)</Radio>
                  <Radio value="70%">Vừa đá (70%)</Radio>
                  <Radio value="100%">Nhiều đá (100%)</Radio>
                </Space>
              </RadioGroup>
            </div>
            
            <div className="mb-4">
              <Title level={4}>Topping:</Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {toppings.map(topping => (
                  <Checkbox 
                    key={topping.id}
                    onChange={(e) => handleToppingChange(topping.id, e.target.checked)}
                    disabled={topping.remainingAmount <= 0}
                  >
                    {topping.name} +{formatCurrency(topping.price)}
                    {topping.remainingAmount <= 0 && (
                      <Tag color="red" className="ml-2">Hết</Tag>
                    )}
                  </Checkbox>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <Title level={4}>Ghi chú:</Title>
              <TextArea 
                rows={2} 
                placeholder="Ghi chú thêm cho món này..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="mb-4">
              <Title level={4}>Số lượng:</Title>
              <div className="flex items-center">
                <Button 
                  icon={<MinusOutlined />} 
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                />
                <InputNumber
                  min={1}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="mx-2 w-16 text-center"
                />
                <Button 
                  icon={<PlusOutlined />} 
                  onClick={() => handleQuantityChange(quantity + 1)}
                />
              </div>
            </div>
            
            <Divider />
            
            <div className="flex justify-between items-center">
              <div className="text-xl font-bold">
                Tổng tiền: {formatCurrency(calculateTotalPrice())}
              </div>
              <Button 
                type="primary" 
                icon={<ShoppingCartOutlined />} 
                size="large"
                onClick={handleAddToOrder}
                disabled={product.remainingAmount <= 0}
                className="bg-green-500 hover:bg-green-600"
              >
                Thêm vào đơn hàng
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

};
export default StaffProductDetailScreen;
