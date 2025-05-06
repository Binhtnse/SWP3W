import { Table, Button, Input, Select } from "antd";
import styled from "styled-components";

interface Order {
  id: number;
  totalPrice: number;
  status: string;
  createAt: string;
  updateAt: string | null;
  deleteAt: string | null;
  userId: number;
  userName: string;
  paymentMethod: string | null;
}

export const Container = styled.div`
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 24px;
  transition: all 0.3s ease;
`;

export const Header = styled.div`
  background: linear-gradient(to right, #7c3aed, #4f46e5) !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  margin-bottom: 1.5rem !important;
  padding: 1.5rem !important;
  * {
    color: #ffffff !important;
  }
`;

export const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  color: #ffffff !important;
   h1, h2, h3, h4, h5, h6, span, p {
    color: #ffffff !important;
  }
`;

export const IconContainer = styled.div`
  font-size: 28px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

export const ContentCard = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
`;

export const FilterSection = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background-color: #f0f7ff;
  border-radius: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  border: 1px solid #e6f7ff;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #e6f7ff;
  }
`;

export const StyledTable = styled(Table)<{ dataSource: Order[] }>`
  .ant-table-thead > tr > th {
    background-color: #f0f5ff;
    font-weight: 600;
    padding: 16px;
    transition: background-color 0.3s;
  }
  
  .ant-table-tbody > tr:hover > td {
    background-color: #f0f7ff;
  }
  
  .ant-table-tbody > tr > td {
    padding: 16px;
    transition: all 0.3s;
  }
  
  .ant-table-row {
    cursor: pointer;
    transition: all 0.2s;
  }
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 8px;
`;

export const StyledButton = styled(Button)`
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  
  &.ant-btn-primary {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
    }
  }
  
  &.ant-btn-danger {
    background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
    border: none;
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(255, 77, 79, 0.3);
    }
  }
`;

export const StyledInput = styled(Input)`
  border-radius: 6px;
  padding: 8px 12px;
  
  &:hover, &:focus {
    border-color: #40a9ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
`;

export const StyledSelect = styled(Select)`
  .ant-select-selector {
    border-radius: 6px !important;
    padding: 4px 12px !important;
  }
  
  &:hover .ant-select-selector {
    border-color: #40a9ff !important;
  }
  
  &.ant-select-focused .ant-select-selector {
    border-color: #1890ff !important;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
  }
`;

export const StatusTag = styled.div<{ status: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 500;
  font-size: 14px;
  background-color: ${props => {
    switch (props.status) {
      case 'PREPARING': return '#fff7e6';
      case 'DELIVERED': return '#e6f7ff';
      case 'CANCELLED': return '#fff1f0';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'PREPARING': return '#fa8c16';
      case 'DELIVERED': return '#1890ff';
      case 'CANCELLED': return '#f5222d';
      default: return '#8c8c8c';
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'PREPARING': return '#ffd591';
      case 'DELIVERED': return '#91d5ff';
      case 'CANCELLED': return '#ffa39e';
      default: return '#d9d9d9';
    }
  }};
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
`;

export const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;