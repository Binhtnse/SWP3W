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
  const [extraProducts, setExtraProducts] = useState<Product[]>([]);
  const [filteredCombos, setFilteredCombos] = useState<Combo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [mainProductError, setMainProductError] = useState('');


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
    setSearchTerm(e.target.value);
  };
  

  const handleResetSearch = () => {
    setSearchTerm('');
    setStatusFilter(null);
    setPagination(prev => ({ ...prev, current: 1 }));
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

  const fetchExtraProducts = async () => {
    try {
      const headers = getAuthHeader();
      if (!headers) return;

      const res = await axios.get('https://beautiful-unity-production.up.railway.app/api/products/filter', {
        params: { productType: 'SINGLE', productUsage: 'EXTRA' },
        headers
      });
      setExtraProducts(res.data.data);
    } catch (error) {
      message.error('Không thể tải sản phẩm extra');
    }
  };

  useEffect(() => {
    fetchCombos();
    fetchProducts();
    fetchCategories();
    fetchExtraProducts();
  }, []);

  useEffect(() => {
    let filtered = combos; 
    if (searchTerm) {
      filtered = filtered.filter(combo =>
        combo.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } 
    if (statusFilter) {
      filtered = filtered.filter(combo => combo.status === statusFilter);
    }
    setFilteredCombos(filtered);
  }, [searchTerm, statusFilter, combos]);


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
          comboItems: (detail.itemsResponse || []).filter((item: ComboItem) => item.size !== 'EXTRA').map((item: ComboItem) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size
          })),
          extraItems: (detail.itemsResponse || []).filter((item: ComboItem) => item.size === 'EXTRA').map((item: ComboItem) => ({
            productId: item.productId,
            quantity: item.quantity
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
        const values = await form.validateFields();
        const isEditing = editingCombo !== null;

        if (!values.comboItems || values.comboItems.length === 0) {
          setMainProductError('Vui lòng thêm sản phẩm chính vào combo!');
          return;
        } else {
          setMainProductError('');
        }

        const headers = getAuthHeader();
        if (!headers) return; 

   
        if (!isEditing || (isEditing && (
            values.productCode.toLowerCase() !== editingCombo.productCode.toLowerCase() ||
            values.name.toLowerCase() !== editingCombo.name.toLowerCase()
        ))) {
            const existsCode = combos.some(combo => combo.productCode.toLowerCase() === values.productCode.toLowerCase());
            const existsName = combos.some(combo => combo.name.toLowerCase() === values.name.toLowerCase());
            if (existsCode) {
                form.setFields([
                    {
                        name: 'productCode',
                        errors: ['Mã sản phẩm đã tồn tại']
                    }
                ]);
                return;
            }
            if (existsName) {
                form.setFields([
                    {
                        name: 'name',
                        errors: ['Tên combo đã tồn tại']
                    }
                ]);
                return;
            }
        }

        const comboItems: ComboItem[] = values.comboItems || [];
        const extraItems: ComboItem[] = values.extraItems || [];

        // Merge combo items (with size)
        const mergedComboItems: Record<string, ComboItem> = {};
        comboItems.forEach(item => {
            const key = `${item.productId}_${item.size}`;
            if (mergedComboItems[key]) {
                mergedComboItems[key].quantity += item.quantity;
            } else {
                mergedComboItems[key] = { ...item };
            }
        });

        // Merge extra items (without size)
        const mergedExtraItems: Record<string, ComboItem> = {};
        extraItems.forEach(item => {
            const key = item.productId;
            if (mergedExtraItems[key]) {
                mergedExtraItems[key].quantity += item.quantity;
            } else {
                mergedExtraItems[key] = { ...item, size: 'EXTRA' };
            }
        });

        const payload = {
            ...values,
            basePrice: values.basePrice,
            productType: 'COMBO',
            productUsage: 'MAIN',
            status: 'ACTIVE',
            comboItems: [
                ...Object.values(mergedComboItems),
                ...Object.values(mergedExtraItems)
            ],
        };

        if (editingCombo) {
            await axios.put(`https://beautiful-unity-production.up.railway.app/api/products/v2/${editingCombo.id}/combo`, payload, { headers });
            message.success('Combo đã được cập nhật');
        } else {
            await axios.post('https://beautiful-unity-production.up.railway.app/api/products/v2', payload, { headers });
            message.success('Combo đã được tạo');
        }

        form.resetFields();
        fetchCombos();
        setIsModalVisible(false);
    } catch (err) {
        console.error(err);
        message.error('Thao tác thất bại');
    }
};

  return (
    <ManagerLayout>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
      <Input
  placeholder="Tìm theo tên combo"
  value={searchTerm}
  onChange={handleSearch}
  style={{ width: 300 }}
/>
  <Select
    allowClear
    placeholder="Lọc theo trạng thái"
    style={{ width: 200 }}
    value={statusFilter || undefined}
    onChange={(value) => setStatusFilter(value || null)}
  >
    <Option value="ACTIVE">Đang hoạt động</Option>
    <Option value="DELETED">Ngừng hoạt động</Option>
  </Select>
  <Button onClick={handleResetSearch}>Đặt lại tìm kiếm</Button>
</div>


      <Button type="primary" onClick={() => showModal()}>Tạo combo mới</Button>
      <Table
  dataSource={filteredCombos}
  rowKey="id"
  loading={loading}
  pagination={{
    current: pagination.current,
    pageSize: pagination.pageSize,
    onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
    showSizeChanger: true,
    pageSizeOptions: ['5', '10', '20', '50'],
    showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} combo`
  }}
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
                    <span>{item.productName} - {item.quantity}  {item.size !== 'EXTRA' && <>  Size: {item.size}</>}</span>
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

      <Modal
        title={editingCombo ? 'Chỉnh sửa combo' : 'Tạo combo mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        footer={[
          <Button key="reset" onClick={() => form.resetFields()}>
            Reset form
          </Button>,
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            OK
          </Button>,
        ]}
      >

        <Form
          form={form}
          layout="vertical"
          onValuesChange={(changed, all) => {
            if (all.comboItems && all.comboItems.length > 0) {
              setMainProductError('');
            }
          }}
        >
          <Form.Item
            name="productCode"
            label="Mã sản phẩm"
            validateTrigger="onBlur"
            rules={[
              { required: true, message: 'Vui lòng nhập mã sản phẩm!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  const isEditing = editingCombo !== null;
                  const currentCode = isEditing ? editingCombo.productCode : null;
                  const exists = combos.some(combo => combo.productCode.toLowerCase() === value.toLowerCase() && value.toLowerCase() !== (currentCode ? currentCode.toLowerCase() : ''));
                  if (exists) {
                    return Promise.reject('Mã sản phẩm đã tồn tại');
                  }
                  return Promise.resolve();
                }
              })
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên combo"
            validateTrigger="onBlur"
            rules={[
              { required: true, message: 'Vui lòng nhập tên combo!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  const isEditing = editingCombo !== null;
                  const currentName = isEditing ? editingCombo.name : null;
                  const exists = combos.some(combo => combo.name.toLowerCase() === value.toLowerCase() && value.toLowerCase() !== (currentName ? currentName.toLowerCase() : ''));
                  if (exists) {
                    return Promise.reject('Tên combo đã tồn tại');
                  }
                  return Promise.resolve();
                }
              })
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="basePrice"
            label="Giá combo"
            rules={[
              { required: true, message: 'Vui lòng nhập giá combo!' },
              { type: 'number', min: 0.01, message: 'Giá phải lớn hơn 0!' }
            ]}
          >
            <InputNumber min={0.01} />
          </Form.Item>
          <Form.Item name="imageUrl" label="URL hình ảnh">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="categoryId" hidden rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          {/* Combo Items (Có size) */}
          <Form.List name="comboItems">
            {(fields, { add, remove }) => {
              const currentItems = form.getFieldValue('comboItems') || [];
              const usedKeys = new Set(currentItems.map((item: ComboItem) => `${item.productId}_${item.size}`));

              const handleAdd = () => {
                const allCombinations = filteredProducts.flatMap(p =>
                  ['S', 'M', 'L', 'XL'].map(size => ({
                    key: `${p.id}_${size}`,
                    label: `${p.name} - ${size}`,
                    productId: p.id,
                    size,
                    imageUrl: p.imageUrl
                  }))
                );
                const available = allCombinations.find(c => !usedKeys.has(c.key));
                if (!available) {
                  message.warning('Đã thêm tất cả sản phẩm với các size');
                  return;
                }
                add({ productId: available.productId, size: available.size, quantity: 1, imageUrl: available.imageUrl });
              };

              return (
                <>
                  <h4>Sản phẩm chính</h4>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item {...restField} name={[name, 'productId']} rules={[{ required: true }]}>
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
                    {mainProductError && (
                      <div style={{ color: 'red', marginTop: 4 }}>{mainProductError}</div>
                    )}
                  </Form.Item>
                </>
              );
            }}
          </Form.List>

          {/* Extra Items (Không có size) */}
          <Form.List name="extraItems">
            {(fields, { add, remove }) => (
              <>
                <h4>Sản phẩm Extra</h4>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'productId']}
                      rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                    >
                      <Select placeholder="Chọn sản phẩm extra" style={{ width: 250 }}>
                        {extraProducts.map(product => (
                          <Option key={product.id} value={product.id}>{product.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Nhập số lượng' }]}
                    >
                      <InputNumber min={1} />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)}>Xóa</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>Thêm Extra</Button>
                </Form.Item>
              </>
            )}
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
                    <div>
                      SL: {item.quantity}
                      {item.size !== 'EXTRA' && <> - Size: {item.size}</>}
                    </div>

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