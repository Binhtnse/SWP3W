/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Table, Typography, Select, Card, Statistic, Spin, message, Image } from 'antd';
import axios from 'axios';
import ManagerLayout from '../components/ManagerLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

const ManagerIncomeScreen: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
    const [aggregatedData, setAggregatedData] = useState<any[]>([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [productImages, setProductImages] = useState<{ [key: string]: string }>({});

    const getAuthHeader = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            message.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            return null;
        }
        return { Authorization: `Bearer ${token}` };
    };

    const fetchAggregatedData = async (filterType: string) => {
        setLoading(true);
        let url = '';

        switch (filterType) {
            case 'daily':
                url = 'https://beautiful-unity-production.up.railway.app/api/v1/dashboard/revenue/daily';
                break;
            case 'weekly':
                url = 'https://beautiful-unity-production.up.railway.app/api/v1/dashboard/revenue/weekly';
                break;
            case 'monthly':
                url = 'https://beautiful-unity-production.up.railway.app/api/v1/dashboard/revenue/monthly';
                break;
            case 'yearly':
                url = 'https://beautiful-unity-production.up.railway.app/api/v1/dashboard/revenue/yearly';
                break;
            default:
                break;
        }

        try {
            const headers = getAuthHeader();
            if (!headers) return;

            const response = await axios.get(url, {
                headers,
            });
            const data = response.data;

            setAggregatedData(data);

     
            const totalIncome = data.reduce((sum: number, item: any) => sum + item.totalRevenue, 0);
            setTotalIncome(totalIncome);

        } catch (error) {
            console.error("Error fetching aggregated data:", error);
            message.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const fetchTopProducts = async () => {
        try {
            const headers = getAuthHeader();
            if (!headers) return;

            const response = await axios.get('https://beautiful-unity-production.up.railway.app/api/v1/dashboard/stats', {
                headers,
            });
            const data = response.data;

            setTopProducts(data.top3Products); 


            fetchProductImages(data.top3Products);
        } catch (error) {
            console.error("Error fetching top products:", error);
            message.error('Không thể tải dữ liệu sản phẩm');
        }
    };


    const fetchProductImages = async (topProducts: any[]) => {
        try {
            const headers = getAuthHeader();
            if (!headers) return;


            const productRequests = topProducts.map(product =>
                axios.get(`https://beautiful-unity-production.up.railway.app/api/products/filter?productName=${product.name}`, { headers })
            );

            const responses = await Promise.all(productRequests);
            const images: { [key: string]: string } = {};

            responses.forEach((response, index) => {

                const imageUrl = response.data[0]?.image || '';
                images[topProducts[index].name] = imageUrl;
            });

            setProductImages(images);

        } catch (error) {
            console.error("Error fetching product images:", error);
            message.error('Không thể tải hình ảnh sản phẩm');
        }
    };

    useEffect(() => {
        fetchAggregatedData(filterType);
        fetchTopProducts();
    }, [filterType]);


    const formatPeriod = (date: string, filterType: string) => {
        const momentDate = moment(date);
        switch (filterType) {
            case 'daily':
                return momentDate.format('DD/MM/YYYY');
            case 'weekly':
                return `Tuần ${momentDate.week()}`;
            case 'monthly':
                return momentDate.format('MM/YYYY');
            case 'yearly':
                return date;
            default:
                return date;
        }
    };

    const columns = [
        { title: 'Thời gian', dataIndex: 'period', key: 'period' },
        { title: 'Thu nhập (VND)', dataIndex: 'income', key: 'income', render: (val: number) => val.toLocaleString('vi-VN') + ' ₫' },
    ];


    const chartData = aggregatedData.map((item: any) => ({
        period: item[filterType],
        revenue: item.totalRevenue,
        quantity: item.totalOrders,
    }));

    return (
        <ManagerLayout>
            <div style={{ padding: 24 }}>
                <Title level={2}>📊 Quản lý thu nhập</Title>

                {/* Highlight Top 3 Products */}
                <Card title="Top 3 Sản Phẩm" style={{ marginBottom: 24, backgroundColor: '#f5f5f5', padding: '16px' }}>
                    <Table
                        columns={[
                            { title: 'Sản phẩm', dataIndex: 'name', key: 'name' },
                            { title: 'Số lượng bán', dataIndex: 'quantity', key: 'quantity' },
                            {
                                title: 'Hình ảnh', dataIndex: 'image', key: 'image', render: (text: string, record: any) => (
                                    <Image width={50} src={productImages[record.name]} fallback="fallback-image-url.jpg" />
                                )
                            },
                        ]}
                        dataSource={topProducts.map((item, idx) => ({
                            key: idx,
                            name: item.name,
                            quantity: item.quantity,
                        }))}
                        pagination={false}
                    />
                </Card>

                {/* Total Income */}
                <Card style={{ marginBottom: 24 }}>
                    <Statistic title="Tổng thu nhập" value={totalIncome} suffix="₫" valueStyle={{ color: '#3f8600' }} formatter={(val) => Number(val).toLocaleString('vi-VN')} />
                </Card>

                <Card style={{ marginBottom: 24 }}>
                    <span style={{ marginRight: 12 }}>Xem theo:</span>
                    <Select value={filterType} onChange={(val) => setFilterType(val)} style={{ width: 200 }}>
                        <Option value="daily">Theo ngày</Option>
                        <Option value="weekly">Theo tuần</Option>
                        <Option value="monthly">Theo tháng</Option>
                        <Option value="yearly">Theo năm</Option>
                    </Select>
                </Card>

                {loading ? (
                    <Spin size="large" />
                ) : (
                    <>
                        {/* Bar Chart */}
                        <Card style={{ marginBottom: 24 }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu (VND)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Data Table */}
                        <Table
                            columns={columns}
                            dataSource={aggregatedData.map((item, idx) => ({
                                key: idx,
                                period: filterType === 'daily' ? formatPeriod(item.orderDate, filterType) :
                                    filterType === 'weekly' ? `Tuần ${item.week}` :
                                        filterType === 'monthly' ? formatPeriod(item.month, filterType) :
                                            formatPeriod(item.year, filterType),
                                income: item.totalRevenue,
                            }))}
                            pagination={false}
                        />
                    </>
                )}
            </div>
        </ManagerLayout>
    );
};

export default ManagerIncomeScreen;
