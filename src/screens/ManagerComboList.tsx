/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
  Table,
  message,
  Modal,
  Button,
  Descriptions,
  Card,
  Form,
  Input,
  Select,
  Tag,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import ManagerLayout from '../components/ManagerLayout';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

interface Combo {
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
  comboItems: ComboItem[];
}

interface ComboItem {
  productId: number;
  quantity: number;
  size: string;
  product: Product;
}

interface Product {
  id: number;
  name: string;
  basePrice: number;
  productCode: string;
  imageUrl: string;
  productType: string;
}

interface Category {
  id: number;
  name: string;
}

const ManagerComboList: React.FC = () => {
  const [data, setData] = useState<Combo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDetailVisible, setIsDetailVisible] = useState<boolean>(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddProductModalVisible, setIsAddProductModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [productList, setProductList] = useState<Product[]>([]);
  const [comboItems, setComboItems] = useState<ComboItem[]>([]);
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      message.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      navigate('/login');
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    // Check if user is authenticated and has manager role
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('userRole');
    
    if (!token || role !== 'MANAGER') {
      message.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
    
    fetchCombos();
    fetchCategories();
  }, []);


  const fetchCombos = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      if (!headers) return;
      
      const response = await axios.get(
        'https://beautiful-unity-production.up.railway.app/api/products',
        {
          params: { productType: 'COMBO' },
          headers
        }
      );
      setData(response.data.data);
    } catch (error) {
      message.error('Không thể tải danh sách combo');
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const headers = getAuthHeader();
      if (!headers) return;
      
      const res = await axios.get(
        'https://beautiful-unity-production.up.railway.app/api/category',
        { headers }
      );
      setCategories(res.data.data);
      const defaultCategory = res.data.data.find((cat: Category) => cat.name === 'Đồ uống');
      if (defaultCategory) {
        createForm.setFieldsValue({ categoryId: defaultCategory.id });
      }
    } catch (error) {
      message.error('Không thể tải danh mục');
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/');
      }
    }
  };

  const fetchSingleProducts = async () => {
    try {
      const headers = getAuthHeader();
      if (!headers) return;
      
      const res = await axios.get(
        'https://beautiful-unity-production.up.railway.app/api/products', 
        {
          params: { productType: 'SINGLE' },
          headers
        }
      );
      setProductList(res.data.data);
    } catch (error) {
      message.error('Không thể tải danh sách sản phẩm');
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/');
      }
    }
  };

  const showComboDetails = async (combo: Combo) => {
    setEditingCombo(combo);
    setIsDetailVisible(true);
    try {
      const headers = getAuthHeader();
      if (!headers) return;
      
      const res = await axios.get(
        `https://beautiful-unity-production.up.railway.app/api/products/${combo.id}/combo`,
        { headers }
      );
      const items = res.data.itemsResponse || [];
      if (items.length === 0) {
        message.warning('Không có sản phẩm trong combo');
      }

      const formattedItems: ComboItem[] = [];
      for (const item of items) {
        const productRes = await axios.get(
          `https://beautiful-unity-production.up.railway.app/api/products/${item.productId}`,
          { headers }
        );
        const product = productRes.data;

        formattedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          product: {
            id: item.productId,
            name: item.productName,
            imageUrl: product.imageUrl || '',
            productCode: '',
            basePrice: 0,
            productType: '',
          },
        });
      }

      setComboItems(formattedItems);
    } catch (error) {
      message.error('Không thể tải sản phẩm trong combo');
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/');
      }
      setComboItems([]);
    }
  };

  const handleCreateCombo = async (values: any) => {
    const defaultCategory = categories.find(cat => cat.name === 'Đồ uống');
    if (!defaultCategory) {
      message.error('Không tìm thấy danh mục "Đồ uống".');
      return;
    }
    try {
      const headers = getAuthHeader();
      if (!headers) return;
      
      await axios.post(
        'https://beautiful-unity-production.up.railway.app/api/products', 
        {
          name: values.name,
          productCode: values.productCode,
          basePrice: values.basePrice,
          description: values.description,
          imageUrl: values.imageUrl,
          categoryId: defaultCategory.id,
          productType: 'COMBO',
          productUsage: 'MAIN',
        },
        { headers }
      );

      message.success('Tạo combo thành công!');
      setIsCreateModalVisible(false);
      createForm.resetFields();
      fetchCombos();
    } catch (error) {
      message.error('Tạo combo thất bại!');
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/');
      }
    }
  };

  const handleAddProductToCombo = async (values: any) => {
    if (!editingCombo) return;
    const comboItems = values.comboItems;

    if (comboItems.length === 0) {
      message.error('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    try {
      const headers = getAuthHeader();
      if (!headers) return;
      
      await axios.put(
        `https://beautiful-unity-production.up.railway.app/api/products/${editingCombo.id}/combo`,
        {
          comboItems: comboItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
          })),
        },
        { headers }
      );
      message.success('Thêm sản phẩm vào combo thành công!');
      setIsAddProductModalVisible(false);
      addForm.resetFields();
      showComboDetails(editingCombo);
    } catch (error) {
      message.error('Thêm sản phẩm thất bại');
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/');
      }
    }
  };

  const getNotes = (combo: Combo) => {
    const isProductInCombo = combo.comboItems && combo.comboItems.length > 0;
    return isProductInCombo ? (
      <Tag color="green">Đã có sản phẩm</Tag>
    ) : (
      <Tag color="red">Chưa có sản phẩm</Tag>
    );
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      render: (imageUrl: string) => (
        <img src={imageUrl} alt="Combo" style={{ width: 100, height: 100 }} />
      ),
    },
    {
      title: 'Tên combo',
      dataIndex: 'name',
      render: (text: string, record: Combo) => (
        <a onClick={() => showComboDetails(record)}>{text}</a>
      ),
    },
    {
      title: 'Mã combo',
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
      title: 'Trạng thái',
      dataIndex: 'status',
    },
    {
      title: 'Ghi chú',
      render: (_: any, record: Combo) => getNotes(record),
    },
  ];

  return (
    <ManagerLayout>
      <div>
        <h1>Quản lý combo</h1>
        <div style={{ marginBottom: 20, display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button icon={<ReloadOutlined />} onClick={() => fetchCombos()}>
            Tải lại
          </Button>
          <Button type="primary" onClick={() => setIsCreateModalVisible(true)}>
            Tạo combo mới
          </Button>
        </div>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title="Chi tiết Combo"
        visible={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={null}
        width={800}
      >
        {editingCombo ? (
          <>
            <Button type="dashed" onClick={() => { setIsAddProductModalVisible(true); fetchSingleProducts(); }} style={{ marginBottom: '16px' }}>
              Thêm sản phẩm vào combo
            </Button>
            <Descriptions bordered column={1} size="default" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Tên Combo">{editingCombo.name}</Descriptions.Item>
              <Descriptions.Item label="Mã Combo">{editingCombo.productCode}</Descriptions.Item>
              <Descriptions.Item label="Giá">{editingCombo.basePrice} VND</Descriptions.Item>
              <Descriptions.Item label="Mô tả">{editingCombo.description}</Descriptions.Item>
              <Descriptions.Item label="Hình ảnh">
                <img src={editingCombo.imageUrl} alt="Combo" style={{ width: '100%', height: 'auto' }} />
              </Descriptions.Item>
              <Descriptions.Item label="Sản phẩm trong combo">
                {comboItems.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {comboItems.map((item) => (
                      <Card
                        key={item.productId}
                        style={{ width: 180, marginBottom: '16px' }}
                        hoverable
                        cover={
                          <img
                            alt={item.product.name}
                            src={item.product.imageUrl || 'default-image.jpg'}
                            style={{ height: 120, objectFit: 'cover' }}
                          />
                        }
                      >
                        <Card.Meta
                          title={item.product.name}
                          description={`${item.quantity} x ${item.size}`}
                        />
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p>Không có sản phẩm trong combo.</p>
                )}
              </Descriptions.Item>
            </Descriptions>
          </>
        ) : (
          <p>Không có dữ liệu combo.</p>
        )}
      </Modal>

      <Modal
        title="Tạo Combo Mới"
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onOk={() => createForm.submit()}
        okText="Tạo"
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateCombo}>
          <Form.Item label="Tên Combo" name="name" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item label="Mã Combo" name="productCode" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item label="Giá Cơ Bản" name="basePrice" rules={[{ required: true }]}> <Input type="number" /> </Form.Item>
          <Form.Item label="Mô Tả" name="description"> <Input.TextArea /> </Form.Item>
          <Form.Item label="Link Hình Ảnh" name="imageUrl" rules={[{ required: true }]}> <Input placeholder="https://..." /> </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm sản phẩm vào combo"
        visible={isAddProductModalVisible}
        onCancel={() => setIsAddProductModalVisible(false)}
        onOk={() => addForm.submit()}
        okText="Thêm"
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddProductToCombo}>
          <Form.List
            name="comboItems"
            initialValue={[]}
            rules={[
              {
                validator: async (_, names) => {
                  if (!names || names.length < 1) {
                    return Promise.reject(new Error('Phải thêm ít nhất một sản phẩm'));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <div key={key} style={{ display: 'flex', marginBottom: '16px' }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'productId']}
                      fieldKey={[fieldKey || 'defaultKey', 'productId']} 
                      label="Sản phẩm"
                      rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
                    >
                      <Select placeholder="Chọn sản phẩm">
                        {productList.map((p) => (
                          <Option key={p.id} value={p.id}>{p.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      fieldKey={[fieldKey || 'defaultKey', 'quantity']}
                      label="Số lượng"
                      rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                    >
                      <Input type="number" min={1} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'size']}
                      fieldKey={[fieldKey || 'defaultKey', 'size']}
                      label="Size"
                      rules={[{ required: true, message: 'Vui lòng chọn size' }]}
                    >
                      <Select>
                        <Option value="S">S</Option>
                        <Option value="M">M</Option>
                        <Option value="L">L</Option>
                      </Select>
                    </Form.Item>

                    <Button
                      type="default"
                      danger
                      onClick={() => remove(name)}
                      icon={<ReloadOutlined />}
                      style={{ alignSelf: 'center' }}
                    >
                      Xoá
                    </Button>
                  </div>
                ))}

                <Form.Item>
                  <Button type="dashed" onClick={() => add()} icon={<ReloadOutlined />}>
                    Thêm sản phẩm
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Thêm sản phẩm vào combo
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </ManagerLayout>
  );
};

export default ManagerComboList;
