import React, { useState, useEffect } from "react";
import {Button,Modal,Form,Input,Space,message,Typography,TableProps,Divider,Tag,} from "antd";
import {EditOutlined,PlusOutlined,SearchOutlined,ReloadOutlined,AppstoreOutlined,} from "@ant-design/icons";
import axios from "axios";
import { ColumnsType } from "antd/es/table";
import { Container, Header, StyledTitle, FilterContainer, FilterRow, StyledTable, ActionButton, AddButton, ResetButton } from "../components/styled components/AdminCategoryStyles";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;
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

const AdminCategoryScreen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    name: "",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
      navigate("/");
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  };

  const fetchCategories = async (page: number = 0, size: number = 10) => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      if (!headers) return;

      const { name } = filters;
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", size.toString());
      
      let url = 'https://beautiful-unity-production.up.railway.app/api/category';
      if (name) {
        url = `https://beautiful-unity-production.up.railway.app/api/category/${name}`;
      }
      const response = await axios.get<CategoryResponse>(
        `${url}?${params.toString()}`,
        { headers }
      );
      setCategories(response.data.data);
      setPagination({
        current: response.data.page + 1,
        pageSize: response.data.size,
        total: response.data.totalElements,
      });
    } catch (error: unknown) {
      console.error("Error fetching categories:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
        navigate("/");
      } else {
        message.error("Không thể tải danh mục");
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleTableChange: TableProps<Category>["onChange"] = (pagination) => {
    if (pagination.current && pagination.pageSize) {
      fetchCategories(pagination.current - 1, pagination.pageSize);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value || "" });
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
      const headers = getAuthHeader();
      if (!headers) return;

      setSubmitting(true);
      const values = await form.validateFields();

      if (editingCategory) {
        await axios.put(
          `https://beautiful-unity-production.up.railway.app/api/category/${editingCategory.id}`,
          values,
          { headers }
        );
        message.success("Cập nhật danh mục thành công");
      } else {
        await axios.post(
          "https://beautiful-unity-production.up.railway.app/api/category",
          values,
          { headers }
        );
        message.success("Tạo danh mục thành công");
      }
      setModalVisible(false);
      fetchCategories(pagination.current - 1, pagination.pageSize);
    } catch (error: unknown) {
      console.error("Error saving category:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
        navigate("/");
      } else {
        message.error("Không thể lưu danh mục");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<Category> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "Tên Danh Mục",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Mô Tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Trạng Thái",
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
      title: "Thao Tác",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <ActionButton
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            title="Sửa"
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
          <AppstoreOutlined style={{ marginRight: 8 }} />
          Quản Lý Danh Mục
        </StyledTitle>
        <AddButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddModal}
          size="large"
        >
          Thêm Danh Mục
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
            placeholder="Tìm kiếm theo tên danh mục"
            prefix={<SearchOutlined style={{ color: "#1890ff" }} />}
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            style={{ width: 250 }}
            allowClear
            size="large"
          />
          <ResetButton
            onClick={() => {
              setFilters({ name: "" });
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
        dataSource={categories}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng số ${total} danh mục`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={handleTableChange}
        scroll={{ x: "max-content" }}
        bordered
      />

      <Modal
        title={
          <div
            style={{ display: "flex", alignItems: "center", color: "#1890ff" }}
          >
            {editingCategory ? (
              <EditOutlined style={{ marginRight: 8 }} />
            ) : (
              <PlusOutlined style={{ marginRight: 8 }} />
            )}
            {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </div>
        }
        visible={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={editingCategory ? "Cập Nhật" : "Thêm"}
        cancelText="Hủy"
        okButtonProps={{
          loading: submitting,
          style: { background: "#1890ff", borderColor: "#1890ff" },
        }}
        bodyStyle={{ maxHeight: "70vh", overflow: "auto", padding: "24px" }}
        maskClosable={false}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" name="categoryForm">
          <Form.Item
            name="name"
            label="Tên Danh Mục"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô Tả"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả danh mục" },
            ]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả danh mục" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            initialValue="ACTIVE"
          >
            <Input.Group compact>
              <Button
                style={{
                  width: "50%",
                  borderColor:
                    form.getFieldValue("status") === "ACTIVE"
                      ? "#52c41a"
                      : "#d9d9d9",
                  backgroundColor:
                    form.getFieldValue("status") === "ACTIVE"
                      ? "#f6ffed"
                      : undefined,
                }}
                type={
                  form.getFieldValue("status") === "ACTIVE"
                    ? "primary"
                    : "default"
                }
                onClick={() => form.setFieldsValue({ status: "ACTIVE" })}
                danger={false}
                ghost={form.getFieldValue("status") === "ACTIVE"}
              >
                Hoạt động
              </Button>
              <Button
                style={{
                  width: "50%",
                  borderColor:
                    form.getFieldValue("status") === "INACTIVE"
                      ? "#ff4d4f"
                      : "#d9d9d9",
                  backgroundColor:
                    form.getFieldValue("status") === "INACTIVE"
                      ? "#fff1f0"
                      : undefined,
                }}
                type={
                  form.getFieldValue("status") === "INACTIVE"
                    ? "primary"
                    : "default"
                }
                onClick={() => form.setFieldsValue({ status: "INACTIVE" })}
                danger={form.getFieldValue("status") === "INACTIVE"}
                ghost={form.getFieldValue("status") !== "INACTIVE"}
              >
                Không hoạt động
              </Button>
            </Input.Group>
          </Form.Item>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminCategoryScreen;
