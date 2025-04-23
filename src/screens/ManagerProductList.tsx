/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Table, message, Modal, Button, Form, Input, Select } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import ManagerLayout from '../components/ManagerLayout';

interface Product {
  id: number;
  name: string;
  basePrice: number;
  productCode: string;
  imageUrl: string;
  description: string;
  productType: string;
  productUsage: string;
  status: string;
  createAt: string;
  updateAt: string | null;
  deleteAt: string | null;
  categoryId: number;
  categoryName: string;
}

const ManagerProductList: React.FC = () => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState<{ status?: string; categoryId?: number; productType?: string }>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://beautiful-unity-production.up.railway.app/api/products');
      setData(response.data.data);
    } catch (error) {
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://beautiful-unity-production.up.railway.app/api/category');
      setCategories(response.data.data);
    } catch (error) {
      message.error('Không thể tải danh mục');
    }
  };

  const createProduct = async (values: any) => {
    const productData = {
      name: values.name,
      basePrice: values.basePrice,
      productCode: values.productCode,
      imageUrl: values.imageUrl,
      description: values.description,
      productType: values.productType,
      productUsage: values.productUsage,
      categoryId: values.categoryId,
    };

    try {
      await axios.post('https://beautiful-unity-production.up.railway.app/api/products', productData);
      message.success('Sản phẩm đã được tạo thành công');
      fetchProducts();
    } catch (error) {
      message.error('Không thể tạo sản phẩm');
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      await axios.put(`https://beautiful-unity-production.up.railway.app/api/products/${product.id}`, product);
      message.success('Sản phẩm đã được cập nhật');
      fetchProducts();
    } catch (error) {
      message.error('Không thể cập nhật sản phẩm');
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      await axios.delete(`https://beautiful-unity-production.up.railway.app/api/products/${productId}`);
      message.success('Sản phẩm đã được xóa');
      fetchProducts();
    } catch (error) {
      message.error('Không thể xóa sản phẩm');
    }
  };

  const showAddProductModal = () => {
    setEditingProduct(null);
    setIsModalVisible(true);
  };

  const showEditProductModal = (product: Product) => {
    form.setFieldsValue(product);
    setEditingProduct(product);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingProduct) {
          updateProduct({ ...editingProduct, ...values });
        } else {
          createProduct(values);
        }
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch((info) => {
        console.log('Kiểm tra lỗi:', info);
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const filteredData = data.filter((item) => {
    const matchName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filter.status || item.status === filter.status;
    const matchCategory = !filter.categoryId || item.categoryId === filter.categoryId;
    const matchType = !filter.productType || item.productType === filter.productType;
    return matchName && matchStatus && matchCategory && matchType;
  });

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      render: (imageUrl: string) => <img src={imageUrl} alt="Product" style={{ width: 100, height: 100 }} />,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
    },
    {
      title: 'Mã sản phẩm',
      dataIndex: 'productCode',
    },
    {
      title: 'Giá',
      dataIndex: 'basePrice',
      render: (basePrice: number) => `${basePrice} VND`,
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
    },
    {
      title: 'Loại sản phẩm',
      dataIndex: 'productType',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Product) => (
        <>
          <Button type="link" onClick={() => showEditProductModal(record)}>
            Chỉnh sửa
          </Button>
          <Button type="link" danger onClick={() => deleteProduct(record.id)}>
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <ManagerLayout>
      <div>
        <h1>Quản lý sản phẩm</h1>
        <div style={{ marginBottom: 20, display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            placeholder="Tìm theo tên sản phẩm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            onChange={(value) => setFilter((prev) => ({ ...prev, status: value }))}
            value={filter.status}
            style={{ width: 200 }}
          >
            <Select.Option value="ACTIVE">Đang hoạt động</Select.Option>
            <Select.Option value="INACTIVE">Ngừng hoạt động</Select.Option>
          </Select>
          <Select
            placeholder="Lọc theo danh mục"
            allowClear
            onChange={(value) => setFilter((prev) => ({ ...prev, categoryId: value }))}
            value={filter.categoryId}
            style={{ width: 200 }}
          >
            {categories.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Lọc theo loại sản phẩm"
            allowClear
            onChange={(value) => setFilter((prev) => ({ ...prev, productType: value }))}
            value={filter.productType}
            style={{ width: 200 }}
          >
            <Select.Option value="SINGLE">SINGLE</Select.Option>
            <Select.Option value="COMBO">COMBO</Select.Option>
          </Select>

          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setFilter({});
              setSearchTerm('');
            }}
          >
            Đặt lại bộ lọc
          </Button>
        </div>

        <Button type="primary" onClick={showAddProductModal} style={{ marginBottom: 20 }}>
          Thêm sản phẩm
        </Button>
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical" name="productForm">
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="productCode"
            label="Mã sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="basePrice"
            label="Giá"
            rules={[{ required: true, message: 'Vui lòng nhập giá sản phẩm!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="imageUrl" label="Hình ảnh">
            <Input placeholder="Nhập URL hình ảnh" />
          </Form.Item>
          <Form.Item name="productType" label="Loại sản phẩm" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="SINGLE">SINGLE</Select.Option>
              <Select.Option value="COMBO">COMBO</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="productUsage" label="Mục đích sử dụng" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="MAIN">MAIN</Select.Option>
              <Select.Option value="EXTRA">EXTRA</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </ManagerLayout>
  );
};

export default ManagerProductList;
