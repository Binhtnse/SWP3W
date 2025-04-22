import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Space, Modal, Form, DatePicker, message, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import styled from 'styled-components';
import moment from 'moment';
import { TablePaginationConfig, TableProps} from 'antd/lib/table';
import { FilterValue, SorterResult } from 'antd/lib/table/interface';

const { Option } = Select;

// Styled Components
const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  margin: 0;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const StyledTable = styled(Table)<{ dataSource: User[] }>`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`as React.ComponentType<TableProps<User>>;

// Types
interface User {
  id: number;
  fullName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  phoneNumber: string;
  address: string;
  role: 'STAFF' | 'ADMIN' | 'MANAGER';
  status: 'ACTIVE' | 'INACTIVE';
}

interface ApiResponse {
  data: User[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

interface RegisterUserRequest {
    email: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    phoneNumber: string;
    role: string;
    password?: string;
  }

const AdminAccountListScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    name: '',
    gender: '',
    role: '',
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  console.log(submitting)
  const [form] = Form.useForm();

  const fetchUsers = async (page = 0, size = 20) => {
    setLoading(true);
    try {
      const { name, gender, role } = filters;
      const response = await axios.get<ApiResponse>(
        `https://beautiful-unity-production.up.railway.app/api/users/filter?page=${page}&size=${size}&name=${name}&gender=${gender}&role=${role}`
      );
      
      setUsers(response.data.data);
      setPagination({
        ...pagination,
        current: page + 1,
        total: response.data.totalElements,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<User> | SorterResult<User>[],
  ) => {
    console.log(filters);
    console.log(sorter)
    const current = pagination.current || 1;
    const pageSize = pagination.pageSize || 20;
    fetchUsers(current - 1, pageSize);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const showModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      form.setFieldsValue({
        ...user,
        dateOfBirth: moment(user.dateOfBirth),
      });
    } else {
      setEditingUser(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const registerNewUser = async (userData: RegisterUserRequest) => {
    try {
      const response = await axios.post(
        'https://beautiful-unity-production.up.railway.app/api/authentication/register',
        userData
      );
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
      };
  
      if (editingUser) {
        // Update user with PUT request
        await axios.put(
          `https://beautiful-unity-production.up.railway.app/api/users/${editingUser.id}`,
          formattedValues
        );
        message.success(`Tài khoản ${formattedValues.fullName} đã được cập nhật thành công`);
      } else {
        // Create user using the register API
        const registerData: RegisterUserRequest = {
          email: formattedValues.email,
          fullName: formattedValues.fullName,
          dateOfBirth: formattedValues.dateOfBirth,
          gender: formattedValues.gender,
          address: formattedValues.address,
          phoneNumber: formattedValues.phoneNumber,
          role: formattedValues.role,
          password: formattedValues.password
        };
  
        await registerNewUser(registerData);
        message.success(`Tài khoản ${formattedValues.fullName} đã được tạo thành công`);
      }
  
      setIsModalVisible(false);
      fetchUsers(pagination.current - 1, pagination.pageSize);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        const errorResponse = error.response as { data: { message?: string } };
        message.error(`Lỗi: ${errorResponse.data.message || 'Không thể thực hiện thao tác'}`);
      } else {
        message.error('Không thể thực hiện thao tác. Vui lòng thử lại sau.');
      }
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: number) => {
  Modal.confirm({
    title: 'Bạn có chắc chắn muốn xóa tài khoản này?',
    content: 'Hành động này không thể hoàn tác.',
    okText: 'Đồng ý',
    okType: 'danger',
    cancelText: 'Hủy',
    onOk: async () => {
      try {
        // Delete user with DELETE request
        await axios.delete(
          `https://beautiful-unity-production.up.railway.app/api/users/${userId}`
        );
        message.success('Tài khoản đã được xóa thành công');
        fetchUsers(pagination.current - 1, pagination.pageSize);
      } catch (error) {
        console.error('Error deleting user:', error);
        message.error('Không thể xóa tài khoản');
      }
    },
  });
};

const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a: User, b: User) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => {
        const genderText = gender === 'Male' ? 'Nam' : 'Nữ';
        return <Tag color={gender === 'Male' ? 'blue' : 'pink'}>{genderText}</Tag>;
      },
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        let color = 'green';
        let roleText = 'Nhân viên';
        
        if (role === 'ADMIN') {
          color = 'red';
          roleText = 'Quản trị viên';
        } else if (role === 'MANAGER') {
          color = 'blue';
          roleText = 'Quản lý';
        }
        
        return <Tag color={color}>{roleText}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusText = status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động';
        return <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{statusText}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: User) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
            title="Sửa"
          />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
            title="Xóa"
          />
        </Space>
      ),
    },
  ];

  return (
    <Container>
      <Header>
        <Title>Quản lý tài khoản</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          Thêm tài khoản mới
        </Button>
      </Header>

      <FilterContainer>
        <Input
          placeholder="Tìm kiếm theo tên"
          prefix={<SearchOutlined />}
          value={filters.name}
          onChange={(e) => handleFilterChange('name', e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        <Select
          placeholder="Lọc theo giới tính"
          style={{ width: 150 }}
          value={filters.gender || undefined}
          onChange={(value) => handleFilterChange('gender', value)}
          allowClear
        >
          <Option value="Male">Nam</Option>
          <Option value="Female">Nữ</Option>
        </Select>
        <Select
          placeholder="Lọc theo vai trò"
          style={{ width: 150 }}
          value={filters.role || undefined}
          onChange={(value) => handleFilterChange('role', value)}
          allowClear
        >
          <Option value="ADMIN">Quản trị viên</Option>
          <Option value="STAFF">Nhân viên</Option>
          <Option value="MANAGER">Quản lý</Option>
        </Select>
        <Button 
          onClick={() => {
            setFilters({ name: '', gender: '', role: '' });
          }}
        >
          Đặt lại bộ lọc
        </Button>
      </FilterContainer>

      <StyledTable
  columns={columns}
  dataSource={users}
  rowKey="id"
  pagination={pagination}
  loading={loading}
  onChange={handleTableChange}
/>

      <Modal
        title={editingUser ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        width={600}
        okText={editingUser ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            name="dateOfBirth"
            label="Ngày sinh"
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày" format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
          >
            <Select placeholder="Chọn giới tính">
              <Option value="Male">Nam</Option>
              <Option value="Female">Nữ</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="ADMIN">Quản trị viên</Option>
              <Option value="STAFF">Nhân viên</Option>
              <Option value="MANAGER">Quản lý</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="ACTIVE">Hoạt động</Option>
              <Option value="INACTIVE">Không hoạt động</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminAccountListScreen;
