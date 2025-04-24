import React, { useState, useEffect } from "react";
import { Card, Tag, Input, Select, Spin, message, Row, Col, Badge, Empty, Pagination, Button, Dropdown,Menu,} from "antd";
import {FilterOutlined, ShoppingOutlined, AppstoreOutlined, UnorderedListOutlined, DownOutlined,} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { StyledCard, StyledHeader, HeaderContent, LogoSection, IconContainer, TitleContainer, SearchContainer, FilterSection, FilterContent, Separator, FilterControls, ViewControls } from "../components/styled components/StaffProductStyles";

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
  const [sortParam, setSortParam] = useState<string>("name");
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
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
  }, [currentPage, pageSize, sortParam]);

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
        `https://beautiful-unity-production.up.railway.app/api/products?page=${currentPage - 1}&size=${pageSize}&sort=${sortParam}`
      );
      
      setProducts(response.data.data);
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
      
      const productsWithCategory = response.data.data.map(product => ({
        ...product,
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
      
      setProducts(productsWithCategory);
      setTotalElements(response.data.totalElements);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      message.error("Không thể tải danh sách sản phẩm theo danh mục");
      setLoading(false);
    }
  };

  const handleProductClick = (productId: number, productType: string) => {
    console.log(productType)
    navigate(`/staff/products/${productId}`);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    switch (value) {
      case "name":
        setSortParam("name");
        break;
      case "price-asc":
        setSortParam("basePrice");
        break;
      case "price-desc":
        setSortParam("basePrice,desc");
        break;
      default:
        setSortParam("name");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || 
      (product.category && product.categoryName === filterCategory);
    const isActive = product.status === "ACTIVE";
    return matchesSearch && matchesCategory && isActive;
  });

  const sortedProducts = filteredProducts;

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
                onClick={() => handleProductClick(product.id, product.productType)}
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
                  </div>
                }
              >
                  <div className="flex flex-col flex-grow">
                    <h3 className="text-lg font-medium mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="text-sm text-gray-500 mb-2">
                      {product.categoryName || 'Không có danh mục'}
                    </div>
                    <div className="text-lg font-bold text-red-600 mb-2">
                      {formatCurrency(product.basePrice)}
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
            <Card key={product.id} className="overflow-hidden" hoverable
            onClick={() => handleProductClick(product.id, product.productType)}>
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
                </div>
                <div className="p-4 flex-1 min-h-[12rem] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-medium">{product.name}</h3>
                        <div className="text-sm text-gray-500 mt-1">
                          {product.categoryName}
                        </div>
                      </div>
                      <Tag color={product.status === "ACTIVE" ? "green" : "red"}>
                        {product.status === "ACTIVE" ? "Đang bán" : "Ngừng bán"}
                      </Tag>
                    </div>
                    <div className="text-xl font-bold text-red-600 mt-2">
                      {formatCurrency(product.basePrice)}
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
                    : "Tên A-Z"}{" "}
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
