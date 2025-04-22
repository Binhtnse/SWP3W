/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import axios from 'axios';

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
  ];

  return (
    <div>
      <h1>Product Manager</h1>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          total: 1, 
        }}
      />
    </div>
  );
};

export default ManagerProductList;
