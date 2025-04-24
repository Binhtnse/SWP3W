import { Button, Card, Table, Typography } from 'antd';
import { TableProps } from "antd/lib/table";
import styled from 'styled-components';

const { Title} = Typography;

interface Category {
    id: number;
    name: string;
    description: string;
    status: string;
    createAt: string;
    updateAt: string | null;
    deleteAt: string | null;
  }

export const Container = styled.div`
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background-color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

export const StyledTitle = styled(Title)`
  margin: 0 !important;
  color: #1890ff;
`;

export const FilterContainer = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

export const FilterRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
`;

export const StyledTable = styled(Table)<{ dataSource: Category[] }>`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .ant-table-thead > tr > th {
    background-color: #f0f7ff;
    color: #1890ff;
    font-weight: 600;
  }

  .ant-table-tbody > tr:hover > td {
    background-color: #e6f7ff;
  }
` as React.ComponentType<TableProps<Category>>;

export const ActionButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AddButton = styled(Button)`
  background: #1890ff;
  border-color: #1890ff;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
  height: 40px;
  border-radius: 6px;

  &:hover {
    background: #40a9ff;
    border-color: #40a9ff;
  }
`;

export const ResetButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 5px;
`;