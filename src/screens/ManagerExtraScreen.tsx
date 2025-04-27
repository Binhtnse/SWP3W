/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

const ManagerExtraScreen: React.FC = () => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState<{ status?: string; categoryId?: number; productType?: string }>({});
  const [searchTerm, setSearchTerm] = useState<string>(''); 
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [pageSize]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://beautiful-unity-production.up.railway.app/api/products/filter', {
        params: {
          productType: 'SINGLE',
          productUsage: 'EXTRA',
          limit: pageSize,
        },
      });
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
      productType: 'SINGLE',
      productUsage: 'EXTRA',
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
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditProductModal = (product: Product) => {
    form.setFieldsValue(product);
    setEditingProduct(product);
    setIsModalVisible(true);
  };

  const showDetailModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalVisible(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedProduct(null);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingProduct) {
          const updatedProduct = {
            ...editingProduct,
            ...values,
            imageUrl: values.imageUrl || editingProduct.imageUrl,
          };
          updateProduct(updatedProduct);
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

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
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
      render: (_: any, record: Product) => (
        <Button type="link" onClick={() => showDetailModal(record)}>
          {record.name}
        </Button>
      ),
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
        <h1>Quản lý sản phẩm EXTRA</h1>
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
            value={pageSize}
            onChange={handlePageSizeChange}
            style={{ width: 150 }}
          >
            <Select.Option value={10}>10 sản phẩm</Select.Option>
            <Select.Option value={20}>20 sản phẩm</Select.Option>
            <Select.Option value={50}>50 sản phẩm</Select.Option>
            <Select.Option value={100}>100 sản phẩm</Select.Option>
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
          pagination={{ pageSize: pageSize }}
        />
      </div>

      <Modal
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          name="productForm"
          initialValues={{
            productType: 'SINGLE',
            productUsage: 'EXTRA',
          }}
        >
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mã sản phẩm"
            name="productCode"
            rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="basePrice"
            rules={[{ required: true, message: 'Vui lòng nhập giá sản phẩm!' }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label="URL hình ảnh"
            name="imageUrl"
          >
            <Input placeholder="Nhập link hình ảnh..." />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
          >
            <Select>
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </ManagerLayout>
  );
};

export default ManagerExtraScreen;
