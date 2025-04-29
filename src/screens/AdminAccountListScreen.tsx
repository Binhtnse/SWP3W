import React, { useEffect, useState } from "react";
import {
  Input,
  Select,
  Space,
  Modal,
  Form,
  DatePicker,
  message,
  Tag,
  Typography,
  Divider,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import { TablePaginationConfig } from "antd/lib/table";
import { FilterValue, SorterResult } from "antd/lib/table/interface";
import {
  Container,
  Header,
  StyledTitle,
  FilterContainer,
  FilterRow,
  StyledTable,
  ActionButton,
  AddButton,
  ResetButton,
} from "../components/styled components/AdminAccountListStyles";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const { Text } = Typography;

interface User {
  id: number;
  fullName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  gender: "Male" | "Female";
  phoneNumber: string;
  address: string;
  role: "STAFF" | "ADMIN" | "MANAGER";
  status: "ACTIVE" | "INACTIVE";
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
    name: "",
    gender: "",
    role: "",
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  console.log(submitting);
  const [isDeleteModalVisible, setIsDeleteModalVisible] =
    useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      navigate("/");
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  };

  const fetchUsers = async (page = 0, size = 20) => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      if (!headers) return;

      const { name, gender, role } = filters;
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", size.toString());

      if (name) params.append("name", name);
      if (gender) params.append("gender", gender);
      if (role) params.append("role", role);

      const response = await axios.get<ApiResponse>(
        `https://beautiful-unity-production.up.railway.app/api/users/filter?${params.toString()}`,
        { headers }
      );

      setUsers(response.data.data);
      setPagination({
        ...pagination,
        current: page + 1,
        total: response.data.totalElements,
      });
    } catch (error: unknown) {
      console.error("Error fetching users:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        navigate("/");
      } else {
        message.error("Không thể tải danh sách tài khoản");
      }
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
    sorter: SorterResult<User> | SorterResult<User>[]
  ) => {
    console.log(filters);
    console.log(sorter);
    const current = pagination.current || 1;
    const pageSize = pagination.pageSize || 20;
    fetchUsers(current - 1, pageSize);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value || undefined });
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
    const headers = getAuthHeader();
    if (!headers) return;

    try {
      const response = await axios.post(
        "https://beautiful-unity-production.up.railway.app/api/authentication/register",
        userData,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        dateOfBirth: values.dateOfBirth.format("YYYY-MM-DD"),
      };

      const headers = getAuthHeader();
      if (!headers) {
        setSubmitting(false);
        return;
      }

      if (editingUser) {
        const updateData = { ...formattedValues };
        if (formattedValues.newPassword) {
          updateData.password = formattedValues.newPassword;
        }
        delete updateData.newPassword;
        delete updateData.confirmNewPassword;

        await axios.put(
          `https://beautiful-unity-production.up.railway.app/api/users/${editingUser.id}`,
          updateData,
          { headers }
        );
        message.success(
          `Tài khoản ${formattedValues.fullName} đã được cập nhật thành công`
        );
      } else {
        const registerData: RegisterUserRequest = {
          email: formattedValues.email,
          fullName: formattedValues.fullName,
          dateOfBirth: formattedValues.dateOfBirth,
          gender: formattedValues.gender,
          address: formattedValues.address,
          phoneNumber: formattedValues.phoneNumber,
          role: formattedValues.role,
          password: formattedValues.password,
        };
        delete formattedValues.confirmPassword;

        await registerNewUser(registerData);
        message.success(
          `Tài khoản ${formattedValues.fullName} đã được tạo thành công`
        );
      }

      setIsModalVisible(false);
      fetchUsers(pagination.current - 1, pagination.pageSize);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response
      ) {
        const errorResponse = error.response as {
          data: { message?: string };
          status?: number;
        };

        if (errorResponse.status === 401) {
          message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          navigate("/");
        } else if (errorResponse.status === 409) {
          message.error(
            `Lỗi: ${
              errorResponse.data.message || "Email đã tồn tại trong hệ thống"
            }`
          );
        } else {
          message.error(
            `Lỗi: ${
              errorResponse.data.message || "Không thể thực hiện thao tác"
            }`
          );
        }
      } else {
        message.error("Không thể thực hiện thao tác. Vui lòng thử lại sau.");
      }
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const showDeleteModal = (userId: number) => {
    setUserToDelete(userId);
    setIsDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      const headers = getAuthHeader();
      if (!headers) return;

      await axios.delete(
        `https://beautiful-unity-production.up.railway.app/api/users/${userToDelete}`,
        { headers }
      );
      message.success("Tài khoản đã được xóa thành công");
      fetchUsers(pagination.current - 1, pagination.pageSize);
    } catch (error: unknown) {
      console.error("Error deleting user:", error);
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "status" in error.response &&
        error.response.status === 401
      ) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        navigate("/");
      } else {
        message.error("Không thể xóa tài khoản");
      }
    } finally {
      setIsDeleteModalVisible(false);
      setUserToDelete(null);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a: User, b: User) => a.fullName.localeCompare(b.fullName),
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender: string) => {
        const genderText = gender === "Male" ? "Nam" : "Nữ";
        return (
          <Tag color={gender === "Male" ? "blue" : "magenta"}>{genderText}</Tag>
        );
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        let color = "green";
        let roleText = "Nhân viên";

        if (role === "ADMIN") {
          color = "red";
          roleText = "Quản trị viên";
        } else if (role === "MANAGER") {
          color = "blue";
          roleText = "Quản lý";
        }

        return <Tag color={color}>{roleText}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusText =
          status === "ACTIVE" ? "Hoạt động" : "Không hoạt động";
        return (
          <Tag color={status === "ACTIVE" ? "success" : "error"}>
            {statusText}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: unknown, record: User) => (
        <Space>
          <ActionButton
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            title="Sửa"
            shape="circle"
          />
          <ActionButton
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteModal(record.id)}
            title="Xóa"
            shape="circle"
          />
        </Space>
      ),
    },
  ];

  return (
    <Container>
      <Header>
        <StyledTitle level={3}>
          <UserOutlined style={{ marginRight: 8 }} />
          Quản lý tài khoản
        </StyledTitle>
        <AddButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          size="large"
        >
          Thêm tài khoản mới
        </AddButton>
      </Header>

      <FilterContainer>
        <Text
          strong
          style={{ fontSize: 16, marginBottom: 16, display: "block" }}
        >
          Bộ lọc tìm kiếm
        </Text>
        <Divider style={{ margin: "12px 0" }} />
        <FilterRow>
          <Input
            placeholder="Tìm kiếm theo tên"
            prefix={<SearchOutlined style={{ color: "#1890ff" }} />}
            value={filters.name || ""}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            style={{ width: 250 }}
            allowClear
            size="large"
          />
          <Select
            placeholder="Lọc theo giới tính"
            style={{ width: 180 }}
            value={filters.gender || undefined}
            onChange={(value) => handleFilterChange("gender", value)}
            allowClear
            size="large"
          >
            <Option value="Male">Nam</Option>
            <Option value="Female">Nữ</Option>
          </Select>
          <Select
            placeholder="Lọc theo vai trò"
            style={{ width: 180 }}
            value={filters.role || undefined}
            onChange={(value) => handleFilterChange("role", value)}
            allowClear
            size="large"
          >
            <Option value="ADMIN">Quản trị viên</Option>
            <Option value="STAFF">Nhân viên</Option>
            <Option value="MANAGER">Quản lý</Option>
          </Select>
          <ResetButton
            onClick={() => {
              setFilters({ name: "", gender: "", role: "" });
            }}
            icon={<ReloadOutlined />}
            size="large"
          >
            Đặt lại bộ lọc
          </ResetButton>
        </FilterRow>
      </FilterContainer>

      <StyledTable
        columns={columns}
        dataSource={users}
        rowKey="id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng số ${total} tài khoản`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: "max-content" }}
        bordered
      />

      <Modal
        title={
          <div
            style={{ display: "flex", alignItems: "center", color: "#1890ff" }}
          >
            {editingUser ? (
              <EditOutlined style={{ marginRight: 8 }} />
            ) : (
              <PlusOutlined style={{ marginRight: 8 }} />
            )}
            {editingUser ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
          </div>
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        width={600}
        okText={editingUser ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        okButtonProps={{
          loading: submitting,
          style: { background: "#1890ff", borderColor: "#1890ff" },
        }}
        bodyStyle={{ maxHeight: "70vh", overflow: "auto", padding: "24px" }}
        maskClosable={false}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Vui lòng nhập email hợp lệ" },
            ]}
          >
            <Input placeholder="Nhập địa chỉ email" />
          </Form.Item>
          {!editingUser && (
            <>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu" },
                  { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                    message:
                      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
                  },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Xác nhận mật khẩu" />
              </Form.Item>
            </>
          )}
          {editingUser && (
            <>
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới (để trống nếu không thay đổi)"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve(); // Skip validation if empty
                      if (value.length < 8) {
                        return Promise.reject(
                          new Error("Mật khẩu phải có ít nhất 8 ký tự")
                        );
                      }
                      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(value)) {
                        return Promise.reject(
                          new Error(
                            "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số"
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>
              <Form.Item
                name="confirmNewPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={["newPassword"]}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (
                        !getFieldValue("newPassword") ||
                        !value ||
                        getFieldValue("newPassword") === value
                      ) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Xác nhận mật khẩu mới" />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="dateOfBirth"
            label="Ngày sinh"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Chọn ngày"
              format="DD/MM/YYYY"
            />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
          >
            <Select placeholder="Chọn giới tính">
              <Option value="Male">Nam</Option>
              <Option value="Female">Nữ</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="ADMIN">Quản trị viên</Option>
              <Option value="STAFF">Nhân viên</Option>
              <Option value="MANAGER">Quản lý</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Xác nhận xóa tài khoản"
        visible={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Đồng ý"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa tài khoản này?</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
    </Container>
  );
};

export default AdminAccountListScreen;
