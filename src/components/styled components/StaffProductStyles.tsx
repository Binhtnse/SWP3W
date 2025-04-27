import styled from 'styled-components';
import { Card, Col, Empty, Row, Tabs} from 'antd';

export const StyledHeader = styled.div`
  background: linear-gradient(to right, #7c3aed, #4f46e5) !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  margin-bottom: 1.5rem !important;
  padding: 1.5rem !important;
`;

export const HeaderContent = styled.div`
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  align-items: center !important;

  @media (min-width: 768px) {
    flex-direction: row !important;
  }
`;

export const LogoSection = styled.div`
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  margin-bottom: 1rem !important;

  @media (min-width: 768px) {
    flex-direction: row !important;
    margin-bottom: 0 !important;
  }
`;

export const IconContainer = styled.div`
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

export const TitleContainer = styled.div`
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

export const SearchContainer = styled.div`
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

export const FilterSection = styled.div`
  background: white !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  padding: 1.5rem !important;
  margin-bottom: 1.5rem !important;
`;

export const FilterContent = styled.div`
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 1.5rem !important; // Increased from previous value
  
  @media (min-width: 768px) {
    flex-direction: row !important;
  }
`;

export const Separator = styled.div`
  height: 1px !important;
  background-color: #e5e7eb !important;
  width: 100% !important;
  margin: 1rem 0 2rem 0 !important; // Add space above and below the separator
`;

export const FilterControls = styled.div`
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 1rem !important;
  margin-bottom: 1rem !important;

  @media (min-width: 768px) {
    margin-bottom: 0 !important;
  }
`;

export const ViewControls = styled.div`
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

export const StyledCard = styled(Card)`
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

export const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 1.5rem !important;
    
    &::before {
      border-bottom: 2px solid #f3f4f6 !important;
    }
  }

  .ant-tabs-tab {
    padding: 0.75rem 1.5rem !important;
    font-size: 1rem !important;
    font-weight: 500 !important;
    color: #6b7280 !important;
    transition: all 0.3s ease !important;
    
    &:hover {
      color: #7c3aed !important;
    }
  }

  .ant-tabs-tab-active .ant-tabs-tab-btn {
    color: #7c3aed !important;
    font-weight: 600 !important;
  }

  .ant-tabs-ink-bar {
    background-color: #7c3aed !important;
    height: 3px !important;
  }

  .ant-tabs-content {
    padding-top: 0.5rem !important;
  }
`;

export const ProductContainer = styled.div`
  margin-bottom: 2rem !important;
`;

export const ProductGrid = styled(Row)`
  margin: 0 -8px !important;
`;

export const ProductCol = styled(Col)`
  padding: 8px !important;
  transition: transform 0.3s ease !important;
  
  &:hover {
    transform: translateY(-4px) !important;
  }
`;

export const StyledEmpty = styled(Empty)`
  padding: 3rem 0 !important;
  
  .ant-empty-image {
    height: 120px !important;
  }
  
  .ant-empty-description {
    color: #6b7280 !important;
    font-size: 1rem !important;
  }
`;

export const ProductCard = styled(StyledCard)`
  border-radius: 0.75rem !important;
  overflow: hidden !important;
  transition: all 0.3s ease !important;
  height: 100% !important;
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
                0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  }
  
  .ant-card-cover {
    height: 220px !important;
  }
  
  .ant-card-body {
    padding: 1.25rem !important;
  }
`;

export const ProductImage = styled.div`
  height: 220px !important;
  overflow: hidden !important;
  position: relative !important;
  
  img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    transition: transform 0.5s ease !important;
  }
  
  &:hover img {
    transform: scale(1.05) !important;
  }
`;

export const ProductTag = styled.div`
  position: absolute !important;
  top: 0.75rem !important;
  left: 0.75rem !important;
  z-index: 10 !important;
`;

export const ProductName = styled.h3`
  font-size: 1.125rem !important;
  font-weight: 600 !important;
  color: #1f2937 !important;
  margin-bottom: 0.5rem !important;
  line-height: 1.4 !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
`;

export const ProductCategory = styled.div`
  font-size: 0.875rem !important;
  color: #6b7280 !important;
  margin-bottom: 0.5rem !important;
`;

export const ProductPrice = styled.div`
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  color: #dc2626 !important;
  margin-bottom: 0.75rem !important;
`;

export const ProductDescription = styled.div`
  font-size: 0.875rem !important;
  color: #6b7280 !important;
  margin-top: 0.75rem !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
`;

export const ComboDetails = styled.div`
  margin-top: 0.75rem !important;
  padding-top: 0.75rem !important;
  border-top: 1px solid #f3f4f6 !important;
  
  .title {
    font-size: 0.875rem !important;
    font-weight: 600 !important;
    color: #4b5563 !important;
    margin-bottom: 0.5rem !important;
  }
  
  ul {
    padding-left: 1.25rem !important;
    margin: 0 !important;
    
    li {
      font-size: 0.8125rem !important;
      color: #6b7280 !important;
      margin-bottom: 0.25rem !important;
    }
  }
`;

export const ListViewCard = styled(Card)`
  margin-bottom: 1rem !important;
  border-radius: 0.75rem !important;
  overflow: hidden !important;
  transition: all 0.3s ease !important;
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
                0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  }
  
  .ant-card-body {
    padding: 0 !important;
  }
`;

export const PaginationContainer = styled.div`
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  flex-wrap: wrap !important;
  margin-top: 2rem !important;
  
  .pagination-info {
    color: #6b7280 !important;
    margin-bottom: 1rem !important;
    
    @media (min-width: 640px) {
      margin-bottom: 0 !important;
    }
  }
  
  .ant-pagination {
    .ant-pagination-item-active {
      border-color: #7c3aed !important;
      
      a {
        color: #7c3aed !important;
      }
    }
    
    .ant-pagination-item:hover a {
      color: #7c3aed !important;
    }
    
    .ant-pagination-prev:hover .ant-pagination-item-link,
    .ant-pagination-next:hover .ant-pagination-item-link {
      color: #7c3aed !important;
      border-color: #7c3aed !important;
    }
  }
`;