/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select, Table, Space, message, Descriptions, Card, Switch } from 'antd';
import axios from 'axios';
import ManagerLayout from '../components/ManagerLayout';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

interface ComboItem {
  productId: string;
  quantity: number;
  size: string;
  productName?: string;
  imageUrl?: string;
}

interface Product {
  id: string;
  name: string;
  imageUrl?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Combo {
  id: string;
  name: string;
  productCode: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
  status: string;
  itemsResponse?: ComboItem[];
}

const ManagerComboList = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [filteredCombos, setFilteredCombos] = useState<Combo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();
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

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      if (!headers) return;
      const res = await axios.get('https://beautiful-unity-production.up.railway.app/api/products/filter', {
        params: { productType: 'COMBO' },
        headers
      });
      const combosData = res.data.data;

      const updatedCombos = await Promise.all(
        combosData.map(async (combo: Combo) => {
          const comboRes = await axios.get(`https://beautiful-unity-production.up.railway.app/api/products/v2/${combo.id}`, { headers });
          const comboDetails = comboRes.data;

          const updatedItems = await Promise.all(
            (comboDetails.itemsResponse || []).map(async (item: ComboItem) => {
              const productRes = await axios.get(`https://beautiful-unity-production.up.railway.app/api/products/${item.productId}`, { headers });
              return {
                ...item,
                productName: productRes.data.name,
                imageUrl: productRes.data.imageUrl,
              };
            })
          );

          return { ...comboDetails, itemsResponse: updatedItems };
        })
      );

      setCombos(updatedCombos);
      setFilteredCombos(updatedCombos);
    } catch (error) {
      message.error('Không thể tải danh sách combo');
    } finally {
      setLoading(false);
    }
  };


  const fetchProducts = async () => {
    try {
      const headers = getAuthHeader();
      if (!headers) return;

      const res = await axios.get('https://beautiful-unity-production.up.railway.app/api/products/filter', {
        params: { productType: 'SINGLE', productUsage: 'MAIN' },
        headers
      });
      setProducts(res.data.data);
    } catch (error) {
      message.error('Không thể tải sản phẩm');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = combos.filter(combo => combo.name.toLowerCase().includes(value.toLowerCase()));
    setFilteredCombos(filtered);
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    setFilteredCombos(combos);
  };

  const handleStatusChange = async (combo: Combo) => {
    const newStatus = combo.status === 'ACTIVE' ? 'DELETED' : 'ACTIVE';
    try {
      const headers = getAuthHeader();
      if (!headers) return;

      await axios.delete(`https://beautiful-unity-production.up.railway.app/api/products/${combo.id}/status`, {
        headers,
        params: { status: newStatus },
      });

      message.success(`Trạng thái combo đã được cập nhật thành ${newStatus}`);
      fetchCombos();
    } catch {
      message.error('Không thể thay đổi trạng thái combo');
    }
  };


  const fetchCategories = async () => {
    try {
      const headers = getAuthHeader();
      if (!headers) return;

      const res = await axios.get('https://beautiful-unity-production.up.railway.app/api/category', { headers });
      setCategories(res.data.data);
    } catch (error) {
      message.error('Không thể tải danh mục');
    }
  };

  useEffect(() => {
    fetchCombos();
    fetchProducts();
    fetchCategories();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showModal = async (record: Combo | null = null) => {
    if (!record) {
      const defaultCategory = categories.find(c => c.name === 'Đồ uống');
      if (!defaultCategory) {
        message.error('Không tìm thấy danh mục Đồ uống');
        return;
      }
      form.setFieldsValue({
        name: undefined,
        productCode: undefined,
        comboItems: [],
        categoryId: defaultCategory.id,
        basePrice: 0
      });
      setEditingCombo(null);
      setIsModalVisible(true);
    } else {
      try {
        const headers = getAuthHeader();
        if (!headers) return;
        const res = await axios.get(`https://beautiful-unity-production.up.railway.app/api/products/v2/${record.id}`, { headers });
        const detail = res.data;
        form.setFieldsValue({
          ...detail,
          comboItems: (detail.itemsResponse || []).map((item: ComboItem) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size
          })),
          basePrice: detail.basePrice,
        });
        setEditingCombo(record);
        setIsModalVisible(true);
      } catch {
        message.error('Không thể tải dữ liệu combo');
      }
    }
  };


  const showDetailModal = async (combo: Combo) => {
    try {
      const headers = getAuthHeader();
      if (!headers) return;

      const res = await axios.get(`https://beautiful-unity-production.up.railway.app/api/products/v2/${combo.id}`, { headers });
      const comboDetails = res.data;

      const productDetailsPromises = comboDetails.itemsResponse.map(async (item: ComboItem) => {
        const productRes = await axios.get(`https://beautiful-unity-production.up.railway.app/api/products/${item.productId}`, { headers });
        return {
          ...item,
          imageUrl: productRes.data.imageUrl,
          productName: productRes.data.name
        };
      });

      const updatedItems = await Promise.all(productDetailsPromises);


      setSelectedCombo({
        ...comboDetails,
        itemsResponse: updatedItems,
      });

      setIsDetailModalVisible(true);
    } catch {
      message.error('Không thể tải chi tiết combo');
    }
  };

  const handleOk = async () => {
    try {
      const headers = getAuthHeader();
      if (!headers) return;

      const values = await form.validateFields();
      const comboItems: ComboItem[] = values.comboItems || [];
      const merged: Record<string, ComboItem> = {};


      comboItems.forEach(item => {
        const key = `${item.productId}_${item.size}`;
        if (merged[key]) {
          merged[key].quantity += item.quantity;
        } else {
          merged[key] = { ...item };
        }
      });

      const payload = {
        ...values,
        basePrice: values.basePrice,
        productType: 'COMBO',
        productUsage: 'MAIN',
        status: 'ACTIVE',
        comboItems: Object.values(merged),
      };

      if (editingCombo) {
        await axios.put(`https://beautiful-unity-production.up.railway.app/api/products/v2/${editingCombo.id}/combo`, payload, { headers });
        message.success('Combo đã được cập nhật');
        fetchCombos();
      } else {
        await axios.post('https://beautiful-unity-production.up.railway.app/api/products/v2', payload, { headers });
        message.success('Combo đã được tạo');
        fetchCombos();
      }

      setIsModalVisible(false);
    } catch {
      message.error('Thao tác thất bại');
    }
  };


  return (
    <ManagerLayout>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo tên combo"
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: 300 }}
        />
        <Button
          style={{ marginLeft: 8 }}
          onClick={handleResetSearch}
          type="default"
        >
          Đặt lại tìm kiếm
        </Button>
      </div>

      <Button type="primary" onClick={() => showModal()}>Tạo combo mới</Button>
      <Table
        dataSource={filteredCombos}
        rowKey="id"
        loading={loading}
        columns={[
          {
            title: 'Mã sản phẩm',
            dataIndex: 'productCode',
          },
          {
            title: 'Tên combo',
            dataIndex: 'name',
            render: (_, record) => (
              <Button type="link" onClick={() => showDetailModal(record)}>{record.name}</Button>
            ),
          },
          {
            title: 'Hình ảnh combo',
            render: (_, record) => (
              <img src={record.imageUrl} alt={record.name} style={{ width: 50, height: 50, objectFit: 'cover' }} />
            ),
          },
          {
            title: 'Giá combo',
            dataIndex: 'basePrice',
            render: (price) => `${price} VND`,
          },
          {
            title: 'Sản phẩm trong combo',
            render: (_, record) => (
              <div>
                {record.itemsResponse && record.itemsResponse.map((item: ComboItem, idx: number) => (
                  <div key={idx}>
                    <span>{item.productName} - {item.quantity} - Size: {item.size}</span>
                  </div>
                ))}
              </div>
            ),
          },
          {
            title: 'Trạng thái',
            render: (_, record) => (
              <Switch
                checked={record.status === 'ACTIVE'}
                onChange={() => handleStatusChange(record)}
                checkedChildren="Đang hoạt động"
                unCheckedChildren="Ngừng hoạt động"
              />
            ),
          },
          {
            title: 'Hành động',
            render: (_, record) => <Button type="link" onClick={() => showModal(record)}>Sửa</Button>
          }
        ]}
      />

      <Modal title={editingCombo ? 'Chỉnh sửa combo' : 'Tạo combo mới'} open={isModalVisible} onOk={handleOk} onCancel={() => setIsModalVisible(false)} width={1000}>
        <Form form={form} layout="vertical">
          <Form.Item name="productCode" label="Mã sản phẩm" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="Tên combo" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="basePrice" label="Giá combo" rules={[{ required: true }]}>
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="imageUrl" label="URL hình ảnh"><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="categoryId" hidden rules={[{ required: true }]}><Input /></Form.Item>

          <Form.List name="comboItems">
            {(fields, { add, remove }) => {
              const currentItems = form.getFieldValue('comboItems') || [];
              const usedKeys = new Set(currentItems.map((item: ComboItem) => `${item.productId}_${item.size}`));

              const handleAdd = () => {
                const allCombinations = filteredProducts.flatMap(p => ['S', 'M', 'L', 'XL'].map(size => ({
                  key: `${p.id}_${size}`,
                  label: `${p.name} - ${size}`,
                  productId: p.id,
                  size,
                  imageUrl: p.imageUrl
                })));
                const available = allCombinations.find(c => !usedKeys.has(c.key));

                if (!available) {
                  message.warning('Đã thêm tất cả sản phẩm với các size');
                  return;
                }

                add({ productId: available.productId, size: available.size, quantity: 1, imageUrl: available.imageUrl });
              };

              return (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item {...restField} name={[name, 'productId']} rules={[{ required: true }]} >
                        <Select placeholder="Chọn sản phẩm" style={{ width: 250 }}>
                          {filteredProducts.map(product => (
                            <Option key={product.id} value={product.id}>{product.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'quantity']} rules={[{ required: true }]}>
                        <InputNumber min={1} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'size']} rules={[{ required: true }]}>
                        <Select style={{ width: 80 }}>
                          <Option value="S">S</Option>
                          <Option value="M">M</Option>
                          <Option value="L">L</Option>
                          <Option value="XL">XL</Option>
                        </Select>
                      </Form.Item>
                      <Button danger onClick={() => remove(name)}>Xóa</Button>
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={handleAdd} block>Thêm sản phẩm</Button>
                  </Form.Item>
                </>
              );
            }}
          </Form.List>
        </Form>
      </Modal>

      <Modal title="Chi tiết combo" open={isDetailModalVisible} onCancel={() => setIsDetailModalVisible(false)} footer={null} width={750}>
        {selectedCombo && (
          <Descriptions bordered column={1} size="default">
            <Descriptions.Item label="Mã sản phẩm">{selectedCombo.productCode}</Descriptions.Item>
            <Descriptions.Item label="Tên combo">{selectedCombo.name}</Descriptions.Item>
            <Descriptions.Item label="Giá combo">{selectedCombo.basePrice} VND</Descriptions.Item>
            <Descriptions.Item label="Mô tả">{selectedCombo.description}</Descriptions.Item>
            <Descriptions.Item label="Hình ảnh combo">
              <img src={selectedCombo.imageUrl} alt="combo" style={{ width: '100%', maxHeight: 300 }} />
            </Descriptions.Item>
            <Descriptions.Item label="Danh sách sản phẩm">
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {(selectedCombo.itemsResponse || []).map((item, idx) => (
                  <Card key={idx} style={{ width: 150, margin: 8 }}>
                    <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: 100, objectFit: 'cover' }} />
                    <div>{item.productName}</div>
                    <div>SL: {item.quantity} - Size: {item.size}</div>
                  </Card>
                ))}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

    </ManagerLayout>
  );
};

export default ManagerComboList;
