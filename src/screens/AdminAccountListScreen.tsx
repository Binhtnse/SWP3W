/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Table, Switch, Typography, Tag, message, Input, Select, Space } from 'antd';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface UserAccount {
  id: string;
  name: string;
  role: 'staff' | 'manager';
  email: string;
  status: 'active' | 'inactive';
}

const AdminAccountListScreen: React.FC = () => {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchText, selectedRole, selectedStatus]);

  const fetchAccounts = () => {
    // Hardcoded data for 10 users
    const dummyData: UserAccount[] = [
      { id: '1', name: 'User 1', role: 'staff', email: 'user1@example.com', status: 'active' },
      { id: '2', name: 'User 2', role: 'manager', email: 'user2@example.com', status: 'inactive' },
      { id: '3', name: 'User 3', role: 'staff', email: 'user3@example.com', status: 'active' },
      { id: '4', name: 'User 4', role: 'manager', email: 'user4@example.com', status: 'inactive' },
      { id: '5', name: 'User 5', role: 'staff', email: 'user5@example.com', status: 'active' },
      { id: '6', name: 'User 6', role: 'manager', email: 'user6@example.com', status: 'inactive' },
      { id: '7', name: 'User 7', role: 'staff', email: 'user7@example.com', status: 'active' },
      { id: '8', name: 'User 8', role: 'manager', email: 'user8@example.com', status: 'inactive' },
      { id: '9', name: 'User 9', role: 'staff', email: 'user9@example.com', status: 'active' },
      { id: '10', name: 'User 10', role: 'manager', email: 'user10@example.com', status: 'inactive' }
    ];
    setAccounts(dummyData);
    setLoading(false);
  };
  

  const filterAccounts = () => {
    let result = [...accounts];
    if (searchText) {
      result = result.filter(acc => acc.name.toLowerCase().includes(searchText.toLowerCase()));
    }
    if (selectedRole !== 'all') {
      result = result.filter(acc => acc.role === selectedRole);
    } else {
      result = result.filter(acc => acc.role === 'staff' || acc.role === 'manager');
    }
    if (selectedStatus !== 'all') {
      result = result.filter(acc => acc.status === selectedStatus);
    }
    setFilteredAccounts(result);
  };

  const toggleStatus = async (id: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      setAccounts(prev =>
        prev.map(acc =>
          acc.id === id ? { ...acc, status: newStatus } : acc
        )
      );
      message.success('Cập nhật trạng thái thành công.');
    } catch (error) {
      message.error('Không thể cập nhật trạng thái.');
    }
  };

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'manager' ? 'blue' : 'green'}>{role}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (_: any, record: UserAccount) => (
        <Switch
          checked={record.status === 'active'}
          checkedChildren="Hoạt động"
          unCheckedChildren="Không hoạt động"
          onChange={() => toggleStatus(record.id, record.status)}
        />
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Quản lý tài khoản nhân sự</Title>

      <Space style={{ marginBottom: 16 }} wrap>
        <Search
          placeholder="Tìm theo tên..."
          allowClear
          onSearch={value => setSearchText(value)}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          value={selectedRole}
          onChange={value => setSelectedRole(value)}
          style={{ width: 160 }}
        >
          <Option value="all">Tất cả vai trò</Option>
          <Option value="staff">Nhân viên</Option>
          <Option value="manager">Quản lý</Option>
        </Select>
        <Select
          value={selectedStatus}
          onChange={value => setSelectedStatus(value)}
          style={{ width: 180 }}
        >
          <Option value="all">Tất cả trạng thái</Option>
          <Option value="active">Hoạt động</Option>
          <Option value="inactive">Không hoạt động</Option>
        </Select>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredAccounts}
        loading={loading}
      />
    </div>
  );
};

export default AdminAccountListScreen;
