/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
  Table,
  message,
  Modal,
  Button,
  Row,
  Col,
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

  useEffect(() => {
    fetchCombos();
    fetchCategories();
  }, []);

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'https://beautiful-unity-production.up.railway.app/api/products',
        {
          params: { productType: 'COMBO' },
        }
      );
      setData(response.data.data);
    } catch (error) {
      message.error('Không thể tải danh sách combo');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        'https://beautiful-unity-production.up.railway.app/api/category'
      );
      setCategories(res.data.data);
    } catch (error) {
      message.error('Không thể tải danh mục');
    }
  };

  const fetchSingleProducts = async () => {
    try {
      const res = await axios.get('https://beautiful-unity-production.up.railway.app/api/products', {
        params: { productType: 'SINGLE' }
      });
      setProductList(res.data.data);
    } catch {
      message.error('Không thể tải danh sách sản phẩm');
    }
  };

  const showComboDetails = async (combo: Combo) => {
    setEditingCombo(combo);
    setIsDetailVisible(true);
    try {
      const res = await axios.get(
        `https://beautiful-unity-production.up.railway.app/api/products/${combo.id}/combo`
      );
      const items = res.data.data.itemsResponse || [];
      const formattedItems: ComboItem[] = items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        product: {
          id: item.productId,
          name: item.productName,
          imageUrl: '',
          productCode: '',
          basePrice: 0,
          productType: '',
        },
      }));
      setComboItems(formattedItems);
    } catch (error) {
      message.error('Không thể tải sản phẩm trong combo');
      setComboItems([]);
    }
  };

  const handleCreateCombo = async (values: any) => {
    try {
      await axios.post('https://beautiful-unity-production.up.railway.app/api/products', {
        name: values.name,
        productCode: values.productCode,
        basePrice: values.basePrice,
        description: values.description,
        imageUrl: values.imageUrl,
        categoryId: values.categoryId,
        productType: 'COMBO',
        productUsage: 'MAIN',
      });

      message.success('Tạo combo thành công!');
      setIsCreateModalVisible(false);
      createForm.resetFields();
      fetchCombos();
    } catch (error) {
      message.error('Tạo combo thất bại!');
    }
  };

  const handleAddProductToCombo = async (values: any) => {
    if (!editingCombo) return;
    try {
      await axios.put(
        `https://beautiful-unity-production.up.railway.app/api/products/${editingCombo.id}/combo`,
        {
          comboItems: [
            {
              productId: values.productId,
              quantity: values.quantity,
              size: values.size,
            },
          ],
        }
      );
      message.success('Thêm sản phẩm vào combo thành công!');
      setIsAddProductModalVisible(false);
      addForm.resetFields();
      showComboDetails(editingCombo);
    } catch {
      message.error('Thêm sản phẩm thất bại');
    }
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
      title: 'Loại sản phẩm',
      dataIndex: 'productType',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
    },
    {
      title: 'Sản phẩm trong combo',
      render: (_: any, record: Combo) => (
        <ul>
          {(record.comboItems || []).map((item, index) => (
            <li key={index}>{item.product?.name || 'Chưa có tên'} - SL: {item.quantity} - Size: {item.size}</li>
          ))}
        </ul>
      ),
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
                            src={item.product.imageUrl}
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
          <Form.Item label="Danh mục" name="categoryId" rules={[{ required: true }]}> <Select placeholder="Chọn danh mục"> {categories.map((cat) => (<Option key={cat.id} value={cat.id}>{cat.name}</Option>))} </Select> </Form.Item>
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
          <Form.Item label="Sản phẩm" name="productId" rules={[{ required: true }]}> <Select placeholder="Chọn sản phẩm"> {productList.map((p) => (<Option key={p.id} value={p.id}>{p.name}</Option>))} </Select> </Form.Item>
          <Form.Item label="Số lượng" name="quantity" rules={[{ required: true }]}> <Input type="number" min={1} /> </Form.Item>
          <Form.Item label="Size" name="size" rules={[{ required: true }]}> <Select> <Option value="S">S</Option> <Option value="M">M</Option> <Option value="L">L</Option> </Select> </Form.Item>
        </Form>
      </Modal>
    </ManagerLayout>
  );
};

export default ManagerComboList;