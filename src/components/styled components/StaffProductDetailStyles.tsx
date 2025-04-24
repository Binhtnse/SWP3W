import styled from 'styled-components';
import { Card, Button, Tag } from 'antd';

export const PageContainer = styled.div`
  padding: 1.5rem !important;
  background-color: #f9fafb !important;
  min-height: 100vh !important;
`;

export const BackButton = styled(Button)`
  margin-bottom: 1.5rem !important;
  &:hover {
    background-color: #f3f4f6 !important;
  }
  border-color: #d1d5db !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
`;

export const ProductCard = styled(Card)`
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  border-radius: 0.75rem !important;
  overflow: hidden !important;
  border: 0 !important;
`;

export const ProductContainer = styled.div`
  display: flex !important;
  flex-direction: column !important;
  
  @media (min-width: 768px) {
    flex-direction: row !important;
  }
`;

export const ImageSection = styled.div`
  width: 100% !important;
  padding: 1rem !important;
  background-color: #f9fafb !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  
  @media (min-width: 768px) {
    width: 40% !important;
  }
`;

export const ImageWrapper = styled.div`
  position: relative !important;
  width: 100% !important;
`;

export const DetailsSection = styled.div`
  width: 100% !important;
  padding: 1.5rem !important;
  background-color: #ffffff !important;
  border-radius: 0 0.75rem 0.75rem 0 !important;
  position: relative !important;
  
  @media (min-width: 768px) {
    width: 60% !important;
    border-left: 1px solid #f0f0f0 !important;
  }
  
  @media (max-width: 767px) {
    border-top: 1px solid #f0f0f0 !important;
    border-radius: 0 0 0.75rem 0.75rem !important;
  }
`;

export const HeaderContainer = styled.div`
  display: flex !important;
  justify-content: space-between !important;
  align-items: flex-start !important;
`;

export const ProductInfo = styled.div``;

export const TagsContainer = styled.div`
  display: flex !important;
  align-items: center !important;
  margin-bottom: 0.5rem !important;
`;

export const DescriptionBox = styled.div`
  background-color: #f9fafb !important;
  padding: 1.25rem !important;
  border-radius: 0.5rem !important;
  margin-bottom: 1.25rem !important;
  border: 1px solid #e5e7eb !important;
  position: relative !important;
  overflow: hidden !important;
  
  &::before {
    content: "" !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    height: 100% !important;
    width: 4px !important;
    background-color: #3b82f6 !important;
  }
  
  &:hover {
    background-color: #f3f4f6 !important;
  }
`;

export const PriceText = styled.div`
  font-size: 1.75rem !important;
  font-weight: 700 !important;
  margin-bottom: 1.25rem !important;
  color: #ef4444 !important;
  display: inline-block !important;
  position: relative !important;
  padding: 0.25rem 0.5rem !important;
  
  &::after {
    content: "" !important;
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 8px !important;
    background-color: rgba(239, 68, 68, 0.2) !important;
    z-index: -1 !important;
    border-radius: 4px !important;
  }
  
  @media (min-width: 768px) {
    font-size: 2rem !important;
  }
`;

export const ComboBox = styled.div`
  margin-bottom: 1rem !important;
  background-color: #eff6ff !important;
  padding: 1rem !important;
  border-radius: 0.5rem !important;
`;

export const ComboList = styled.ul`
  list-style: none !important;
  padding-left: 0 !important;
`;

export const ComboItem = styled.li`
  margin-bottom: 0.5rem !important;
  display: flex !important;
  align-items: center !important;
`;

export const OptionSection = styled.div`
  background-color: #f9fafb !important;
  padding: 1rem !important;
  border-radius: 0.5rem !important;
  margin-bottom: 1.5rem !important;
`;

export const OptionGrid = styled.div`
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 0.5rem !important;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr) !important;
  }
`;

export const ToppingGrid = styled.div`
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 0.75rem !important;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr) !important;
  }
`;

export const ToppingContent = styled.div`
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
`;

export const QuantityContainer = styled.div`
  display: flex !important;
  align-items: center !important;
`;

export const OrderSummary = styled.div`
  position: sticky !important;
  bottom: 0 !important;
  background-color: white !important;
  padding: 1rem !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  border: 1px solid #f3f4f6 !important;
`;

export const SummaryContent = styled.div`
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  align-items: center !important;
  
  @media (min-width: 768px) {
    flex-direction: row !important;
  }
`;

export const TotalPrice = styled.div`
  margin-bottom: 1rem !important;
  
  @media (min-width: 768px) {
    margin-bottom: 0 !important;
  }
`;

export const ActionButtons = styled.div`
  display: flex !important;
  gap: 0.75rem !important;
`;

export const RecommendationsSection = styled.div`
  margin-top: 2rem !important;
`;

export const RecommendationsGrid = styled.div`
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 1rem !important;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr) !important;
  }
`;

export const LoadingContainer = styled.div`
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  height: 100vh !important;
  background-color: #f9fafb !important;
`;

export const LoadingContent = styled.div`
  text-align: center !important;
  padding: 2rem !important;
  background-color: white !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
`;

export const ErrorContainer = styled.div`
  padding: 2rem !important;
  text-align: center !important;
  background-color: #f9fafb !important;
  min-height: 100vh !important;
`;

export const ErrorContent = styled.div`
  background-color: white !important;
  padding: 2rem !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  max-width: 28rem !important;
  margin: 0 auto !important;
`;

export const OptionsButton = styled(Button)`
  background-color: #f3f4f6 !important;
  border-color: #e5e7eb !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.5rem !important;
  padding: 0 1.5rem !important;
  height: 2.75rem !important;
  border-radius: 0.5rem !important;
  margin-bottom: 1.5rem !important;
  
  &:hover {
    background-color: #e5e7eb !important;
    border-color: #d1d5db !important;
  }
`;

export const OptionsSummary = styled.div`
  background-color: #f9fafb !important;
  padding: 1rem !important;
  border-radius: 0.5rem !important;
  border: 1px solid #e5e7eb !important;
  margin-bottom: 1.5rem !important;
`;

export const OptionTag = styled(Tag)`
  margin-bottom: 0.5rem !important;
  padding: 0.25rem 0.5rem !important;
  border-radius: 0.25rem !important;
`;