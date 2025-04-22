/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Table, message, Modal, Descriptions, Button } from 'antd';
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://beautiful-unity-production.up.railway.app/api/products');
      setData(response.data.data);
    } catch (error) {
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const showProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      render: (imageUrl: string) => <img src={imageUrl} alt="Product" style={{ width: 100, height: 100 }} />,
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Code',
      dataIndex: 'productCode',
    },
    {
      title: 'Price',
      dataIndex: 'basePrice',
      render: (basePrice: number) => `${basePrice} VND`,
    },
    {
      title: 'Category',
      dataIndex: 'categoryName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Product) => (
        <Button type="link" onClick={() => showProductDetails(record)}>
          View Details
        </Button>
      ),
    },
  ];

  return (
    <ManagerLayout>
      <div>
        <h1>Product Manager</h1>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
          }}
        />
      </div>

      {/* Product Detail Modal */}
      <Modal
        title="Product Details"
        visible={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {selectedProduct && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Product Name">{selectedProduct.name}</Descriptions.Item>
            <Descriptions.Item label="Product Code">{selectedProduct.productCode}</Descriptions.Item>
            <Descriptions.Item label="Price">{selectedProduct.basePrice} VND</Descriptions.Item>
            <Descriptions.Item label="Category">{selectedProduct.categoryName}</Descriptions.Item>
            <Descriptions.Item label="Status">{selectedProduct.status}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedProduct.description}</Descriptions.Item>
            <Descriptions.Item label="Created At">{selectedProduct.createAt}</Descriptions.Item>
            <Descriptions.Item label="Updated At">{selectedProduct.updateAt || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Deleted At">{selectedProduct.deleteAt || 'N/A'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </ManagerLayout>
  );
};

export default ManagerProductList;
