import React, { useState, useEffect } from 'react';
import { Card, Tag, Input, Select, Spin, message, Row, Col, Badge, Empty, Pagination, Button, Dropdown, Menu } from 'antd';
import { FilterOutlined, ShoppingOutlined, AppstoreOutlined, UnorderedListOutlined, DownOutlined } from '@ant-design/icons';

interface Product {
  id: number;
  name: string;
  price: number;
  remainingAmount: number;
  category: string;
  isCombo: boolean;
  comboItems?: { name: string; quantity: number }[];
  image: string;
  status: 'active' | 'inactive';
}

const { Option } = Select;

// Mock data for products
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Trà sữa truyền thống',
    price: 25000,
    remainingAmount: 50,
    category: 'Trà sữa',
    isCombo: false,
    image: 'https://example.com/trasua.jpg',
    status: 'active'
  },
  {
    id: 2,
    name: 'Trà đào',
    price: 20000,
    remainingAmount: 30,
    category: 'Trà trái cây',
    isCombo: false,
    image: 'https://example.com/tradao.jpg',
    status: 'active'
  },
  {
    id: 3,
    name: 'Cà phê sữa đá',
    price: 18000,
    remainingAmount: 45,
    category: 'Cà phê',
    isCombo: false,
    image: 'https://example.com/caphe.jpg',
    status: 'active'
  },
  {
    id: 4,
    name: 'Combo trà sữa đôi',
    price: 45000,
    remainingAmount: 15,
    category: 'Trà sữa',
    isCombo: true,
    comboItems: [
      { name: 'Trà sữa truyền thống', quantity: 1 },
      { name: 'Trà sữa matcha', quantity: 1 }
    ],
    image: 'https://example.com/combo.jpg',
    status: 'active'
  },
  {
    id: 5,
    name: 'Trà sữa matcha',
    price: 28000,
    remainingAmount: 0,
    category: 'Trà sữa',
    isCombo: false,
    image: 'https://example.com/matcha.jpg',
    status: 'inactive'
  },
  {
    id: 6,
    name: 'Combo gia đình',
    price: 85000,
    remainingAmount: 8,
    category: 'Trà sữa',
    isCombo: true,
    comboItems: [
      { name: 'Trà sữa truyền thống', quantity: 2 },
      { name: 'Trà đào', quantity: 1 },
      { name: 'Cà phê sữa đá', quantity: 1 }
    ],
    image: 'https://example.com/combogiadinh.jpg',
    status: 'active'
  },
  {
    id: 7,
    name: 'Đá xay socola',
    price: 32000,
    remainingAmount: 25,
    category: 'Đá xay',
    isCombo: false,
    image: 'https://example.com/daxay.jpg',
    status: 'active'
  },
  {
    id: 8,
    name: 'Trân châu đen',
    price: 5000,
    remainingAmount: 100,
    category: 'Topping',
    isCombo: false,
    image: 'https://example.com/tranchau.jpg',
    status: 'active'
  }
];

const StaffProductScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    // Use mock data instead of API call
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Simulate API delay
      setTimeout(() => {
        setProducts(mockProducts);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Không thể tải danh sách sản phẩm');
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (value: string) => {
    setFilterCategory(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'stock':
        return b.remainingAmount - a.remainingAmount;
      default:
        return 0;
    }
  });

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const categories = ['Trà sữa', 'Trà trái cây', 'Cà phê', 'Đá xay', 'Topping'];

  const renderComboDetails = (product: Product) => {
    if (!product.isCombo || !product.comboItems) return null;
    
    return (
      <div className="mt-2 text-sm text-gray-600">
        <div className="font-medium mb-1">Bao gồm:</div>
        <ul className="list-disc pl-5">
          {product.comboItems.map((item, index) => (
            <li key={index}>
              {item.name} x {item.quantity}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderGridView = () => {
    return (
      <Row gutter={[16, 16]}>
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map(product => (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              <Badge.Ribbon 
                text={product.status === 'active' ? 'Đang bán' : 'Ngừng bán'} 
                color={product.status === 'active' ? 'green' : 'red'}
                style={{ display: product.status === 'active' ? 'none' : 'block' }}
              >
                <Card 
                  hoverable 
                  className="h-full"
                  cover={
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        alt={product.name} 
                        src={product.image} 
                        className="w-full h-full object-cover"
                      />
                      {product.isCombo && (
                        <div className="absolute top-2 left-2">
                          <Tag color="blue">Combo</Tag>
                        </div>
                      )}
                      {product.remainingAmount === 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">HẾT HÀNG</span>
                        </div>
                      )}
                    </div>
                  }
                >
                  <div className="flex flex-col h-full">
                    <h3 className="text-lg font-medium mb-1 line-clamp-2">{product.name}</h3>
                    <div className="text-sm text-gray-500 mb-2">{product.category}</div>
                    <div className="text-lg font-bold text-red-600 mb-2">{formatCurrency(product.price)}</div>
                    <div className="mb-2">
                      <Tag color={product.remainingAmount > 10 ? 'green' : product.remainingAmount > 0 ? 'orange' : 'red'}>
                        {product.remainingAmount > 0 ? `Còn ${product.remainingAmount}` : 'Hết hàng'}
                      </Tag>
                    </div>
                    {product.isCombo && renderComboDetails(product)}
                  </div>
                </Card>
              </Badge.Ribbon>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty description="Không tìm thấy sản phẩm nào" />
          </Col>
        )}
      </Row>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-4">
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map(product => (
            <Card key={product.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-48 h-48 flex-shrink-0">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                  {product.isCombo && (
                    <div className="absolute top-2 left-2">
                      <Tag color="blue">Combo</Tag>
                    </div>
                  )}
                  {product.remainingAmount === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">HẾT HÀNG</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-medium">{product.name}</h3>
                      <div className="text-sm text-gray-500 mt-1">{product.category}</div>
                    </div>
                    <Tag color={product.status === 'active' ? 'green' : 'red'}>
                      {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                    </Tag>
                  </div>
                  <div className="text-xl font-bold text-red-600 mt-2">{formatCurrency(product.price)}</div>
                  <div className="mt-2">
                    <Tag color={product.remainingAmount > 10 ? 'green' : product.remainingAmount > 0 ? 'orange' : 'red'}>
                      {product.remainingAmount > 0 ? `Còn ${product.remainingAmount}` : 'Hết hàng'}
                    </Tag>
                  </div>
                  {product.isCombo && renderComboDetails(product)}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Empty description="Không tìm thấy sản phẩm nào" />
        )}
      </div>
    );
  };

  const sortMenu = (
    <Menu onClick={(e) => handleSortChange(e.key as string)}>
      <Menu.Item key="name">Tên A-Z</Menu.Item>
      <Menu.Item key="price-asc">Giá: Thấp đến cao</Menu.Item>
      <Menu.Item key="price-desc">Giá: Cao đến thấp</Menu.Item>
      <Menu.Item key="stock">Tồn kho</Menu.Item>
    </Menu>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg mb-6 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-white flex items-center">
                <ShoppingOutlined className="mr-2" /> Milk Tea Shop
              </h1>
              <p className="text-purple-100 mt-1">Quản lý sản phẩm</p>
            </div>
            <div className="w-full md:w-auto">
              <Input.Search
                placeholder="Tìm kiếm sản phẩm..."
                allowClear
                enterButton
                size="large"
                onSearch={handleSearch}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full md:w-80"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
              <Select
                placeholder="Danh mục"
                onChange={handleCategoryFilter}
                className="w-40"
                defaultValue="all"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả danh mục</Option>
                {categories.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
              
              <Dropdown overlay={sortMenu}>
                <Button>
                  Sắp xếp theo: {sortBy === 'name' ? 'Tên A-Z' : 
                    sortBy === 'price-asc' ? 'Giá: Thấp đến cao' : 
                    sortBy === 'price-desc' ? 'Giá: Cao đến thấp' : 
                    'Tồn kho'} <DownOutlined />
                </Button>
              </Dropdown>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Hiển thị:</span>
              <Button 
                type={viewMode === 'grid' ? 'primary' : 'default'} 
                icon={<AppstoreOutlined />} 
                onClick={() => setViewMode('grid')}
              />
              <Button 
                type={viewMode === 'list' ? 'primary' : 'default'} 
                icon={<UnorderedListOutlined />} 
                onClick={() => setViewMode('list')}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" tip="Đang tải sản phẩm..." />
            </div>
          ) : (
            <>
              <div className="mb-6">
                {viewMode === 'grid' ? renderGridView() : renderListView()}
              </div>
              
              <div className="flex justify-between items-center flex-wrap">
                <div className="text-gray-500 mb-4 sm:mb-0">
                  Hiển thị {paginatedProducts.length} trên tổng số {filteredProducts.length} sản phẩm
                </div>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={filteredProducts.length}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger
                  onShowSizeChange={(_current, size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  pageSizeOptions={['8', '16', '24', '32']}
                />
              </div>
            </>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Thống kê nhanh</h2>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="text-center bg-blue-50">
                <div className="text-3xl font-bold text-blue-600">{products.length}</div>
                <div className="text-gray-600">Tổng số sản phẩm</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="text-center bg-green-50">
                <div className="text-3xl font-bold text-green-600">
                  {products.filter(p => p.status === 'active').length}
                </div>
                <div className="text-gray-600">Sản phẩm đang bán</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="text-center bg-red-50">
                <div className="text-3xl font-bold text-red-600">
                  {products.filter(p => p.remainingAmount === 0).length}
                </div>
                <div className="text-gray-600">Sản phẩm hết hàng</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="text-center bg-purple-50">
                <div className="text-3xl font-bold text-purple-600">
                  {products.filter(p => p.isCombo).length}
                </div>
                <div className="text-gray-600">Combo</div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default StaffProductScreen;