import React, { useState, useEffect } from "react";
import { Tag, Input, Spin, message, Col, Badge, Pagination, Button, Dropdown, Menu, Tabs } from "antd";
import {
  ShoppingOutlined, AppstoreOutlined, UnorderedListOutlined, DownOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { StyledHeader, HeaderContent, LogoSection, IconContainer, TitleContainer, SearchContainer, FilterSection, FilterContent, Separator, FilterControls, ViewControls, StyledTabs ,
  ProductContainer,
  ProductGrid,
  ProductCol,
  StyledEmpty,
  ProductCard,
  ProductImage,
  ProductTag,
  ProductName,
  ProductCategory,
  ProductPrice,
  ProductDescription,
  ComboDetails,
  ListViewCard,
  PaginationContainer } from "../components/styled components/StaffProductStyles";
  import { useAuthState } from "../hooks/useAuthState";

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

const { TabPane } = Tabs;

const StaffProductScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(1000);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortParam, setSortParam] = useState<string>("name");
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  console.log(totalPages)
  const [categories, setCategories] = useState<Category[]>([]);
  console.log(categories)
  const [activeTab, setActiveTab] = useState<string>("drinks");
  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuthState();

  useEffect(() => {
    // Check if user is logged in and has the correct role
    if (!isLoggedIn || role !== "STAFF") {
      message.error("Bạn không có quyền truy cập trang này");
      navigate("/login");
      return;
    }
    
    fetchCategories();
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, sortParam, activeTab, isLoggedIn, role, navigate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get<CategoryApiResponse>(
        "https://beautiful-unity-production.up.railway.app/api/category?page=0&size=20",
        getAuthHeaders()
      );
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Không thể tải danh mục sản phẩm");
      
      // Handle unauthorized access
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        navigate("/");
      }
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(
        `https://beautiful-unity-production.up.railway.app/api/products?page=${currentPage - 1}&size=${pageSize}&sort=${sortParam}`,
        getAuthHeaders()
      );
      
      setProducts(response.data.data);
      
      // Filter only active products before setting the total count
      const activeProducts = response.data.data.filter(product => product.status === "ACTIVE");
      setTotalElements(activeProducts.length);
      
      // If you need to adjust total pages based on active products
      const calculatedTotalPages = Math.ceil(activeProducts.length / pageSize);
      setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Không thể tải danh sách sản phẩm");
      setLoading(false);
      
      // Handle unauthorized access
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        navigate("/");
      }
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
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

  const getFilteredProducts = () => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const isActive = product.status === "ACTIVE";
      
      if (activeTab === "drinks") {
        return matchesSearch && isActive && product.categoryName === "Đồ uống" && product.productType === "SINGLE";
      } else if (activeTab === "toppings") {
        return matchesSearch && isActive && product.categoryName === "Topping" && product.productType === "SINGLE";
      } else if (activeTab === "combos") {
        return matchesSearch && isActive && product.productType === "COMBO";
      }
      
      return false;
    });

    if (filterCategory !== "all" && activeTab !== "combos") {
      filtered = filtered.filter(product => product.categoryName === filterCategory);
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const renderComboDetails = (product: Product) => {
    if (product.productType !== "COMBO" || !product.comboItems) return null;

    return (
      <ComboDetails>
        <div className="title">Bao gồm:</div>
        <ul>
          {product.comboItems.map((item, index) => (
            <li key={index}>
              {item.name} x {item.quantity}
            </li>
          ))}
        </ul>
      </ComboDetails>
    );
  };

  const renderGridView = () => {
    return (
      <ProductGrid gutter={[16, 16]}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCol xs={24} sm={12} md={8} lg={6} key={product.id}>
              <Badge.Ribbon
                text={product.status === "ACTIVE" ? "Đang bán" : "Ngừng bán"}
                color={product.status === "ACTIVE" ? "green" : "red"}
                style={{
                  display: product.status === "ACTIVE" ? "none" : "block",
                }}
              >
                <ProductCard
                  hoverable
                  onClick={() => handleProductClick(product.id, product.productType)}
                >
                  <ProductImage>
                    <img
                      alt={product.name}
                      src={product.imageUrl}
                    />
                    {product.productType === "COMBO" && (
                      <ProductTag>
                        <Tag color="blue">Combo</Tag>
                      </ProductTag>
                    )}
                  </ProductImage>
                  <div>
                    <ProductName>{product.name}</ProductName>
                    <ProductCategory>
                      {product.categoryName || 'Không có danh mục'}
                    </ProductCategory>
                    <ProductPrice>
                      {formatCurrency(product.basePrice)}
                    </ProductPrice>
                    {product.productType === "COMBO" && renderComboDetails(product)}
                    <ProductDescription>
                      {product.description}
                    </ProductDescription>
                  </div>
                </ProductCard>
              </Badge.Ribbon>
            </ProductCol>
          ))
        ) : (
          <Col span={24}>
            <StyledEmpty description="Không tìm thấy sản phẩm nào" />
          </Col>
        )}
      </ProductGrid>
    );
  };
  
  const renderListView = () => {
    return (
      <div>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ListViewCard 
              key={product.id} 
              hoverable
              onClick={() => handleProductClick(product.id, product.productType)}
            >
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
                        <ProductName>{product.name}</ProductName>
                        <ProductCategory>
                          {product.categoryName}
                        </ProductCategory>
                      </div>
                      <Tag color={product.status === "ACTIVE" ? "green" : "red"}>
                        {product.status === "ACTIVE" ? "Đang bán" : "Ngừng bán"}
                      </Tag>
                    </div>
                    <ProductPrice>
                      {formatCurrency(product.basePrice)}
                    </ProductPrice>
                    {product.productType === "COMBO" && renderComboDetails(product)}
                    <ProductDescription>
                      {product.description}
                    </ProductDescription>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Mã sản phẩm: {product.productCode}
                  </div>
                </div>
              </div>
            </ListViewCard>
          ))
        ) : (
          <StyledEmpty description="Không tìm thấy sản phẩm nào" />
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

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrentPage(1);
    setFilterCategory("all");
  };

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

        <StyledTabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Đồ uống" key="drinks" />
          <TabPane tab="Topping" key="toppings" />
          <TabPane tab="Combo" key="combos" />
        </StyledTabs>

        <FilterSection>
          <FilterContent className="mb-6">
            <FilterControls>

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
              <ProductContainer>
                {viewMode === "grid" ? renderGridView() : renderListView()}
              </ProductContainer>

              <PaginationContainer>
                <div className="pagination-info">
                  Hiển thị {filteredProducts.length} trên tổng số{" "}
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
              </PaginationContainer>
            </>
          )}
        </FilterSection>
      </div>
    </div>
  );
};

export default StaffProductScreen;
