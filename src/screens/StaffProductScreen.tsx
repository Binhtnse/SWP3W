import React, { useState, useEffect } from "react";
import {
  Card,
  Tag,
  Input,
  Select,
  Spin,
  message,
  Row,
  Col,
  Badge,
  Empty,
  Pagination,
  Button,
  Dropdown,
  Menu,
} from "antd";
import {
  FilterOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  DownOutlined,
} from "@ant-design/icons";
import styled from "styled-components";

interface Product {
  id: number;
  name: string;
  price: number;
  remainingAmount: number;
  category: string;
  isCombo: boolean;
  comboItems?: { name: string; quantity: number }[];
  image: string;
  status: "active" | "inactive";
}

const StyledHeader = styled.div`
  background: linear-gradient(to right, #7c3aed, #4f46e5) !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  margin-bottom: 1.5rem !important;
  padding: 1.5rem !important;
`;

const HeaderContent = styled.div`
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  align-items: center !important;

  @media (min-width: 768px) {
    flex-direction: row !important;
  }
`;

const LogoSection = styled.div`
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  margin-bottom: 1rem !important;

  @media (min-width: 768px) {
    flex-direction: row !important;
    margin-bottom: 0 !important;
  }
`;

const IconContainer = styled.div`
  background-color: white !important;
  padding: 0.75rem !important;
  border-radius: 9999px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
  margin-right: 1rem !important;
  margin-bottom: 0.75rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;

  @media (min-width: 768px) {
    margin-bottom: 0 !important;
  }

  .anticon {
    font-size: 1.875rem !important;
    color: #7c3aed !important;
  }
`;

const TitleContainer = styled.div`
  h1 {
    font-size: 1.875rem !important;
    font-weight: 700 !important;
    color: white !important;
    text-align: center !important;

    @media (min-width: 768px) {
      text-align: left !important;
    }
  }

  p {
    color: #ddd6fe !important;
    margin-top: 0.25rem !important;
    display: flex !important;
    align-items: center !important;
    text-align: center !important;

    @media (min-width: 768px) {
      text-align: left !important;
    }
  }
`;

const SearchContainer = styled.div`
  width: 100% !important;

  @media (min-width: 768px) {
    width: auto !important;
  }

  .ant-input-search {
    width: 100% !important;

    @media (min-width: 768px) {
      width: 20rem !important;
    }
  }
`;

const FilterSection = styled.div`
  background: white !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  padding: 1.5rem !important;
  margin-bottom: 1.5rem !important;
`;

const FilterContent = styled.div`
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 1.5rem !important; // Increased from previous value
  
  @media (min-width: 768px) {
    flex-direction: row !important;
  }
`;

const Separator = styled.div`
  height: 1px !important;
  background-color: #e5e7eb !important;
  width: 100% !important;
  margin: 1rem 0 2rem 0 !important; // Add space above and below the separator
`;

const FilterControls = styled.div`
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 1rem !important;
  margin-bottom: 1rem !important;

  @media (min-width: 768px) {
    margin-bottom: 0 !important;
  }
`;

const ViewControls = styled.div`
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;

  span {
    color: #6b7280 !important;
  }

  .ant-btn {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .ant-btn-primary {
    background-color: #7c3aed !important;
    border-color: #7c3aed !important;
  }
`;

const { Option } = Select;

// Mock data for products
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Trà sữa truyền thống",
    price: 25000,
    remainingAmount: 50,
    category: "Trà sữa",
    isCombo: false,
    image: "https://example.com/trasua.jpg",
    status: "active",
  },
  {
    id: 2,
    name: "Trà đào",
    price: 20000,
    remainingAmount: 30,
    category: "Trà trái cây",
    isCombo: false,
    image: "https://example.com/tradao.jpg",
    status: "active",
  },
  {
    id: 3,
    name: "Cà phê sữa đá",
    price: 18000,
    remainingAmount: 45,
    category: "Cà phê",
    isCombo: false,
    image: "https://example.com/caphe.jpg",
    status: "active",
  },
  {
    id: 4,
    name: "Combo trà sữa đôi",
    price: 45000,
    remainingAmount: 15,
    category: "Trà sữa",
    isCombo: true,
    comboItems: [
      { name: "Trà sữa truyền thống", quantity: 1 },
      { name: "Trà sữa matcha", quantity: 1 },
    ],
    image: "https://example.com/combo.jpg",
    status: "active",
  },
  {
    id: 5,
    name: "Trà sữa matcha",
    price: 28000,
    remainingAmount: 0,
    category: "Trà sữa",
    isCombo: false,
    image: "https://example.com/matcha.jpg",
    status: "inactive",
  },
  {
    id: 6,
    name: "Combo gia đình",
    price: 85000,
    remainingAmount: 8,
    category: "Trà sữa",
    isCombo: true,
    comboItems: [
      { name: "Trà sữa truyền thống", quantity: 2 },
      { name: "Trà đào", quantity: 1 },
      { name: "Cà phê sữa đá", quantity: 1 },
    ],
    image: "https://example.com/combogiadinh.jpg",
    status: "active",
  },
  {
    id: 7,
    name: "Đá xay socola",
    price: 32000,
    remainingAmount: 25,
    category: "Đá xay",
    isCombo: false,
    image: "https://example.com/daxay.jpg",
    status: "active",
  },
  {
    id: 8,
    name: "Trân châu đen",
    price: 5000,
    remainingAmount: 100,
    category: "Topping",
    isCombo: false,
    image: "https://example.com/tranchau.jpg",
    status: "active",
  },
];

const StaffProductScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("name");

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
      console.error("Error fetching products:", error);
      message.error("Không thể tải danh sách sản phẩm");
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

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "stock":
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
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const categories = ["Trà sữa", "Trà trái cây", "Cà phê", "Đá xay", "Topping"];

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
          paginatedProducts.map((product) => (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              <Badge.Ribbon
                text={product.status === "active" ? "Đang bán" : "Ngừng bán"}
                color={product.status === "active" ? "green" : "red"}
                style={{
                  display: product.status === "active" ? "none" : "block",
                }}
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
                          <span className="text-white font-bold text-lg">
                            HẾT HÀNG
                          </span>
                        </div>
                      )}
                    </div>
                  }
                >
                  <div className="flex flex-col h-full">
                    <h3 className="text-lg font-medium mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="text-sm text-gray-500 mb-2">
                      {product.category}
                    </div>
                    <div className="text-lg font-bold text-red-600 mb-2">
                      {formatCurrency(product.price)}
                    </div>
                    <div className="mb-2">
                      <Tag
                        color={
                          product.remainingAmount > 10
                            ? "green"
                            : product.remainingAmount > 0
                            ? "orange"
                            : "red"
                        }
                      >
                        {product.remainingAmount > 0
                          ? `Còn ${product.remainingAmount}`
                          : "Hết hàng"}
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
          paginatedProducts.map((product) => (
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
                      <span className="text-white font-bold text-lg">
                        HẾT HÀNG
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-medium">{product.name}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        {product.category}
                      </div>
                    </div>
                    <Tag color={product.status === "active" ? "green" : "red"}>
                      {product.status === "active" ? "Đang bán" : "Ngừng bán"}
                    </Tag>
                  </div>
                  <div className="text-xl font-bold text-red-600 mt-2">
                    {formatCurrency(product.price)}
                  </div>
                  <div className="mt-2">
                    <Tag
                      color={
                        product.remainingAmount > 10
                          ? "green"
                          : product.remainingAmount > 0
                          ? "orange"
                          : "red"
                      }
                    >
                      {product.remainingAmount > 0
                        ? `Còn ${product.remainingAmount}`
                        : "Hết hàng"}
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
        <StyledHeader>
          <HeaderContent>
            <LogoSection>
              <IconContainer>
                <ShoppingOutlined />
              </IconContainer>
              <TitleContainer>
                <h1>Milk Tea Shop</h1>
                <p>
                  <span>Danh mục sản phẩm</span>
                </p>
              </TitleContainer>
            </LogoSection>
            <SearchContainer>
              <Input.Search
                placeholder="Tìm kiếm sản phẩm..."
                allowClear
                enterButton
                size="large"
                onSearch={handleSearch}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </SearchContainer>
          </HeaderContent>
        </StyledHeader>

        <FilterSection>
          <FilterContent className="mb-6">
            <FilterControls>
              <Select
                placeholder="Danh mục"
                onChange={handleCategoryFilter}
                className="w-40"
                defaultValue="all"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả danh mục</Option>
                {categories.map((category) => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>

              <Dropdown overlay={sortMenu}>
                <Button>
                  Sắp xếp theo:{" "}
                  {sortBy === "name"
                    ? "Tên A-Z"
                    : sortBy === "price-asc"
                    ? "Giá: Thấp đến cao"
                    : sortBy === "price-desc"
                    ? "Giá: Cao đến thấp"
                    : "Tồn kho"}{" "}
                  <DownOutlined />
                </Button>
              </Dropdown>
            </FilterControls>

            <ViewControls>
              <span>Hiển thị:</span>
              <Button
                type={viewMode === "grid" ? "primary" : "default"}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode("grid")}
              />
              <Button
                type={viewMode === "list" ? "primary" : "default"}
                icon={<UnorderedListOutlined />}
                onClick={() => setViewMode("list")}
              />
            </ViewControls>
          </FilterContent>

          <Separator />

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" tip="Đang tải sản phẩm..." />
            </div>
          ) : (
            <>
              <div className="mb-6">
                {viewMode === "grid" ? renderGridView() : renderListView()}
              </div>

              <div className="flex justify-between items-center flex-wrap">
                <div className="text-gray-500 mb-4 sm:mb-0">
                  Hiển thị {paginatedProducts.length} trên tổng số{" "}
                  {filteredProducts.length} sản phẩm
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
                  pageSizeOptions={["8", "16", "24", "32"]}
                />
              </div>
            </>
          )}
        </FilterSection>
      </div>
    </div>
  );
};

export default StaffProductScreen;
