import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Input, Select, Spin, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

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
  };

  const handleCategoryFilter = (value: string) => {
    setFilterCategory(value);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (image: string) => (
        <img src={image} alt="Sản phẩm" className="w-16 h-16 object-cover rounded" />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.isCombo && (
            <Tag color="blue" className="mt-1">Combo</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatCurrency(price),
    },
    {
      title: 'Số lượng còn lại',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      render: (amount: number) => (
        <Tag color={amount > 10 ? 'green' : amount > 0 ? 'orange' : 'red'}>
          {amount > 0 ? amount : 'Hết hàng'}
        </Tag>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Đang bán' : 'Ngừng bán'}
        </Tag>
      ),
    },
  ];

  const expandedRowRender = (record: Product) => {
    if (!record.isCombo || !record.comboItems) return null;
    
    return (
      <div className="p-4 bg-gray-50">
        <h4 className="text-lg font-medium mb-2">Chi tiết combo:</h4>
        <ul className="list-disc pl-5">
          {record.comboItems.map((item, index) => (
            <li key={index} className="mb-1">
              {item.name} x {item.quantity}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const categories = ['Trà sữa', 'Trà trái cây', 'Cà phê', 'Đá xay', 'Topping'];

  return (
    <div className="p-6">
      <Card 
        title={<h2 className="text-2xl font-bold">Quản lý sản phẩm</h2>}
        className="shadow-md"
      >
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Tìm kiếm theo tên sản phẩm"
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-48">
            <Select
              placeholder="Lọc theo danh mục"
              onChange={handleCategoryFilter}
              className="w-full"
              defaultValue="all"
            >
              <Option value="all">Tất cả danh mục</Option>
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Spin size="large" tip="Đang tải..." />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="id"
            expandable={{
              expandedRowRender: record => expandedRowRender(record),
              rowExpandable: record => record.isCombo,
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Tổng cộng ${total} sản phẩm`,
            }}
            className="overflow-x-auto"
          />
        )}
      </Card>
    </div>
  );
};

export default StaffProductScreen;

