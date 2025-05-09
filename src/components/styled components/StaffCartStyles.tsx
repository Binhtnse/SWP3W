import { Button, Tag } from 'antd';
import styled from 'styled-components';

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

export const ContentSection = styled.div`
  background: white !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  padding: 1.5rem !important;
  margin-bottom: 1.5rem !important;
`;

export const ActionButton = styled(Button)`
  &.ant-btn-primary {
    background-color: #7c3aed !important;
    border-color: #7c3aed !important;
  }
  
  &.green {
    background-color: #10b981 !important;
    border-color: #10b981 !important;
    
    &:hover {
      background-color: #059669 !important;
      border-color: #059669 !important;
    }
  }
`;

export const OrderSummary = styled.div`
  display: flex !important;
  flex-direction: column !important;
  
  @media (min-width: 768px) {
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
`;

export const SummaryInfo = styled.div`
  display: flex !important;
  align-items: center !important;
  margin-bottom: 1rem !important;
  
  @media (min-width: 768px) {
    margin-bottom: 0 !important;
  }
`;

export const SummaryActions = styled.div`
  display: flex !important;
  justify-content: flex-end !important;
  gap: 0.5rem !important;
`;

export const LoadingContainer = styled.div`
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  height: 100vh !important;
`;

export const BackButton = styled(Button)`
  display: flex !important;
  align-items: center !important;
`;

export const CartItemContainer = styled.div`
  padding: 16px 0 !important;
  margin-bottom: 8px !important;
  border-radius: 8px !important;
  transition: background-color 0.2s !important;
  
  &:hover {
    background-color: #f9fafb !important;
  }
  
  &.border-t {
    border-top: 1px solid #e5e7eb !important;
    margin-top: 8px !important;
  }
`;

export const CartItemActions = styled.div`
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  margin-left: auto !important; /* This pushes the actions to the right */
  justify-content: flex-end !important;
`;

export const PromotionButton = styled(Button)`
  display: flex !important;
  align-items: center !important;
  margin-top: 8px !important;
  margin-bottom: 8px !important;
  width: 100% !important;
  border: 1px dashed #7c3aed !important;
  color: #7c3aed !important;
  
  &:hover {
    background-color: #f9f4ff !important;
    border-color: #7c3aed !important;
  }
`;

export const PromotionTag = styled(Tag)`
  margin-left: 8px !important;
  font-weight: 500 !important;
`;

export const PromotionModalContent = styled.div`
  max-height: 400px !important;
  overflow-y: auto !important;
  padding-right: 8px !important;
`;

export const PromotionItem = styled.div`
  padding: 12px !important;
  border-radius: 8px !important;
  margin-bottom: 12px !important;
  border: 1px solid #f0f0f0 !important;
  transition: all 0.3s ease !important;
  
  &:hover {
    border-color: #7c3aed !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  }
  
  &.selected {
    border-color: #7c3aed !important;
    background-color: #f9f4ff !important;
  }
`;

export const PromotionSummary = styled.div`
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  width: 100% !important;
  padding: 8px 12px !important;
  background-color: #f9f4ff !important;
  border-radius: 8px !important;
  border: 1px dashed #7c3aed !important;
  margin-bottom: 12px !important;
`;