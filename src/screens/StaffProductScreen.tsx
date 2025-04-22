import React, { useState, useEffect } from "react";
import { Card, Tag, Input, Select, Spin, message, Row, Col, Badge, Empty, Pagination, Button, Dropdown,Menu,} from "antd";
import {FilterOutlined, ShoppingOutlined, AppstoreOutlined, UnorderedListOutlined, DownOutlined,} from "@ant-design/icons";
import styled from "styled-components";
import axios from "axios";

interface Category {
  id: number;
  name: string;
  description: string;
  status: string;
  createAt: string;
  updateAt: string | null;
  deleteAt: string | null;
}

interface Product {
  id: number;
  name: string;
  basePrice: number;
  productCode: string;
  imageUrl: string;
  description: string;
  productType: "SINGLE" | "COMBO";
  productUsage: string;
  status: "ACTIVE" | "INACTIVE";
  createAt: string;
  updateAt: string | null;
  deleteAt: string | null;
  category: Category;
  categoryId: number;
  categoryName: string;
  comboItems?: { name: string; quantity: number }[];
  remainingAmount?: number; // This might need to be added from inventory data
}

interface ApiResponse {
  data: Product[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

interface CategoryApiResponse {
  data: Category[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
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

const StyledCard = styled(Card)`
  .ant-card-cover {
    width: 100% !important;
    height: 280px !important; // Fixed height for all images
    overflow: hidden !important;
  }
  
  .ant-card-body {
    width: 100% !important;
  }
  
  img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }
`;

const { Option } = Select;

const StaffProductScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("name");
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  console.log(totalPages)

  useEffect(() => {
    fetchCategories();
    
    if (filterCategory !== "all") {
      const selectedCategory = categories.find(category => category.name === filterCategory);
      if (selectedCategory) {
        fetchProductsByCategory(selectedCategory.id);
      } else {
        fetchProducts();
      }
    } else {
      fetchProducts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get<CategoryApiResponse>(
        "https://beautiful-unity-production.up.railway.app/api/category?page=0&size=20"
      );
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Không thể tải danh mục sản phẩm");
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(
        `https://beautiful-unity-production.up.railway.app/api/product?page=${currentPage - 1}&size=${pageSize}`
      );
      
      const productsWithStock = response.data.data.map(product => ({
        ...product,
        remainingAmount: Math.floor(Math.random() * 50) // Random stock for demo
      }));
      
      setProducts(productsWithStock);
      setTotalElements(response.data.totalElements);
      setTotalPages(response.data.totalPages);
      setLoading(false);
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
  
    if (value === "all") {
      fetchProducts();
      return;
    }
    
    const selectedCategory = categories.find(category => category.name === value);
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory.id);
    }
  };

  const fetchProductsByCategory = async (categoryId: number) => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(
        `https://beautiful-unity-production.up.railway.app/api/category/${categoryId}/products?page=${currentPage - 1}&size=${pageSize}`
      );
      
      const productsWithStock = response.data.data.map(product => ({
        ...product,
        remainingAmount: Math.floor(Math.random() * 50), // Random stock for demo
        category: {
          id: product.categoryId,
          name: product.categoryName,
          description: "",
          status: "",
          createAt: "",
          updateAt: null,
          deleteAt: null
        }
      }));
      
      setProducts(productsWithStock);
      setTotalElements(response.data.totalElements);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      message.error("Không thể tải danh sách sản phẩm theo danh mục");
      setLoading(false);
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.category.name === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price-asc":
        return a.basePrice - b.basePrice;
      case "price-desc":
        return b.basePrice - a.basePrice;
      case "stock":
        return (b.remainingAmount || 0) - (a.remainingAmount || 0);
      default:
        return 0;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const renderComboDetails = (product: Product) => {
    if (product.productType !== "COMBO" || !product.comboItems) return null;

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
        {sortedProducts.length > 0 ? (
          sortedProducts.map((product) => (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              <Badge.Ribbon
                text={product.status === "ACTIVE" ? "Đang bán" : "Ngừng bán"}
                color={product.status === "ACTIVE" ? "green" : "red"}
                style={{
                  display: product.status === "ACTIVE" ? "none" : "block",
                }}
              >
                <StyledCard
                hoverable
                className="h-full flex flex-col"
                cover={
                  <div className="h-64 overflow-hidden relative" style={{ width: '100%' }}>
                    <img
                      alt={product.name}
                      src={product.imageUrl}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: 'center' }}
                    />
                    {product.productType === "COMBO" && (
                      <div className="absolute top-2 left-2">
                        <Tag color="blue">Combo</Tag>
                      </div>
                    )}
                    {(product.remainingAmount === 0) && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          HẾT HÀNG
                        </span>
                      </div>
                    )}
                  </div>
                }
              >
                  {/* Rest of the card content remains the same */}
                  <div className="flex flex-col flex-grow">
                    <h3 className="text-lg font-medium mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="text-sm text-gray-500 mb-2">
                      {product.category.name}
                    </div>
                    <div className="text-lg font-bold text-red-600 mb-2">
                      {formatCurrency(product.basePrice)}
                    </div>
                    <div className="mb-2">
                      <Tag
                        color={
                          (product.remainingAmount || 0) > 10
                            ? "green"
                            : (product.remainingAmount || 0) > 0
                            ? "orange"
                            : "red"
                        }
                      >
                        {(product.remainingAmount || 0) > 0
                          ? `Còn ${product.remainingAmount}`
                          : "Hết hàng"}
                      </Tag>
                    </div>
                    {product.productType === "COMBO" && renderComboDetails(product)}
                    <div className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {product.description}
                    </div>
                  </div>
                </StyledCard>
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
        {sortedProducts.length > 0 ? (
          sortedProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-64 h-64 flex-shrink-0">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.productType === "COMBO" && (
                    <div className="absolute top-2 left-2">
                      <Tag color="blue">Combo</Tag>
                    </div>
                  )}
                  {(product.remainingAmount === 0) && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        HẾT HÀNG
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 min-h-[12rem] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-medium">{product.name}</h3>
                        <div className="text-sm text-gray-500 mt-1">
                          {product.category.name}
                        </div>
                      </div>
                      <Tag color={product.status === "ACTIVE" ? "green" : "red"}>
                        {product.status === "ACTIVE" ? "Đang bán" : "Ngừng bán"}
                      </Tag>
                    </div>
                    <div className="text-xl font-bold text-red-600 mt-2">
                      {formatCurrency(product.basePrice)}
                    </div>
                    <div className="mt-2">
                      <Tag
                        color={
                          (product.remainingAmount || 0) > 10
                            ? "green"
                            : (product.remainingAmount || 0) > 0
                            ? "orange"
                            : "red"
                        }
                      >
                        {(product.remainingAmount || 0) > 0
                          ? `Còn ${product.remainingAmount}`
                          : "Hết hàng"}
                      </Tag>
                    </div>
                    {product.productType === "COMBO" && renderComboDetails(product)}
                    <div className="text-sm text-gray-500 mt-2 line-clamp-3">
                      {product.description}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Mã sản phẩm: {product.productCode}
                  </div>
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
                loading={categories.length === 0}
              >
                <Option value="all">Tất cả danh mục</Option>
                {categories.map((category) => (
                  <Option key={category.id} value={category.name}>
                    {category.name}
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
                  Hiển thị {sortedProducts.length} trên tổng số{" "}
                  {totalElements} sản phẩm
                </div>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalElements}
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
