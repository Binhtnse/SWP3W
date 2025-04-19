import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Space, 
  Popconfirm, 
  message, 
  Typography,
  TableProps
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import styled from 'styled-components';
import { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { TextArea } = Input;

interface Category {
  id: number;
  name: string;
  description: string;
  status: string;
  createAt: string;
  updateAt: string | null;
  deleteAt: string | null;
}

interface CategoryResponse {
  data: Category[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

const Container = styled.div`
  padding: 24px;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

// Use regular CSS for the table styling to avoid styled-components typing issues
const tableStyle = {
  background: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
};

const AdminCategoryScreen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchCategories = async (page: number = 0, size: number = 10) => {
    setLoading(true);
    try {
      const response = await axios.get<CategoryResponse>(
        `https://beautiful-unity-production.up.railway.app/api/category?page=${page}&size=${size}`
      );
      setCategories(response.data.data);
      setPagination({
        current: response.data.page + 1,
        pageSize: response.data.size,
        total: response.data.totalElements
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Properly type the handleTableChange function to match what Table<Category> expects
  const handleTableChange: TableProps<Category>['onChange'] = (
    pagination, 
  ) => {
    if (pagination.current && pagination.pageSize) {
      fetchCategories(pagination.current - 1, pagination.pageSize);
    }
  };

  const showAddModal = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingCategory) {
        // Update existing category
        await axios.put(
          `https://beautiful-unity-production.up.railway.app/api/category/${editingCategory.id}`,
          values
        );
        message.success('Cập nhật danh mục thành công');
      } else {
        // Create new category
        await axios.post(
          'https://beautiful-unity-production.up.railway.app/api/category',
          values
        );
        message.success('Tạo danh mục thành công');
      }
      
      setModalVisible(false);
      fetchCategories(pagination.current - 1, pagination.pageSize);
    } catch (error) {
      console.error('Error saving category:', error);
      message.error('Không thể lưu danh mục');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`https://beautiful-unity-production.up.railway.app/api/category/${id}`);
      message.success('Xóa danh mục thành công');
      fetchCategories(pagination.current - 1, pagination.pageSize);
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error('Không thể xóa danh mục');
    }
  };

  const columns: ColumnsType<Category> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên Danh Mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa danh mục"
            description="Bạn có chắc chắn muốn xóa danh mục này?"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Container>
      <HeaderContainer>
        <Title level={2}>Quản Lý Danh Mục</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showAddModal}
        >
          Thêm Danh Mục
        </Button>
      </HeaderContainer>

      <Table<Category>
        style={tableStyle}
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={editingCategory ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={editingCategory ? 'Cập Nhật' : 'Thêm'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          name="categoryForm"
        >
          <Form.Item
            name="name"
            label="Tên Danh Mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô Tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả danh mục' }]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả danh mục" />
          </Form.Item>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminCategoryScreen;