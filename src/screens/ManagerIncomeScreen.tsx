/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Table, Typography, Select, Card, Statistic, Spin } from 'antd';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, Legend,
} from 'recharts';

const { Title } = Typography;
const { Option } = Select;

interface OrderItem {
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

interface Order {
    id: string;
    items: OrderItem[];
    totalAmount: number;
    createdAt: Date;
}

interface AggregatedData {
    period: string;
    income: number;
    quantity: number;
}

const rawOrders: Order[] = [
    { id: 'ORD2000', totalAmount: 365000, createdAt: new Date('2022-10-28'), items: [{ quantity: 10, unitPrice: 36500, totalPrice: 365000 }] },
    { id: 'ORD2001', totalAmount: 400000, createdAt: new Date('2022-04-07'), items: [{ quantity: 9, unitPrice: 44444, totalPrice: 400000 }] },
    { id: 'ORD2002', totalAmount: 530000, createdAt: new Date('2024-10-19'), items: [{ quantity: 12, unitPrice: 44166, totalPrice: 530000 }] },
    { id: 'ORD2003', totalAmount: 45000, createdAt: new Date('2023-02-24'), items: [{ quantity: 1, unitPrice: 45000, totalPrice: 45000 }] },
    { id: 'ORD2004', totalAmount: 235000, createdAt: new Date('2022-05-10'), items: [{ quantity: 6, unitPrice: 39166, totalPrice: 235000 }] },
];

const getPeriodKey = (date: Date, type: 'day' | 'week' | 'month' | 'quarter' | 'year') => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    switch (type) {
        case 'day': return `${day}/${month}/${year}`;
        case 'week': {
            const start = new Date(d);
            const diff = d.getDate() - d.getDay();
            start.setDate(diff);
            return `Tuần ${start.getDate()}/${month}/${year}`;
        }
        case 'month': return `Tháng ${month}/${year}`;
        case 'quarter': return `Q${Math.floor((month - 1) / 3) + 1}/${year}`;
        case 'year': return `${year}`;
    }
};

const ManagerIncomeScreen: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
    const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const aggregation: Record<string, AggregatedData> = {};

            for (const order of rawOrders) {
                const key = getPeriodKey(order.createdAt, filterType);
                if (!aggregation[key]) {
                    aggregation[key] = { period: key, income: 0, quantity: 0 };
                }

                aggregation[key].income += order.totalAmount;
                for (const item of order.items) {
                    aggregation[key].quantity += item.quantity;
                }
            }

            const dataList = Object.values(aggregation).sort((a, b) => a.period.localeCompare(b.period));
            setAggregatedData(dataList);
            setLoading(false);
        }, 300);
    }, [filterType]);

    const totalIncome = aggregatedData.reduce((sum, d) => sum + d.income, 0);
    const totalQuantity = aggregatedData.reduce((sum, d) => sum + d.quantity, 0);

    const columns = [
        { title: 'Thời gian', dataIndex: 'period', key: 'period' },
        { title: 'Thu nhập (VND)', dataIndex: 'income', key: 'income', render: (val: number) => val.toLocaleString('vi-VN') + ' ₫' },
        { title: 'Số lượng ly đã bán', dataIndex: 'quantity', key: 'quantity' },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>📊 Quản lý thu nhập & sản phẩm đã bán</Title>

            <Card style={{ marginBottom: 24 }}>
                <span style={{ marginRight: 12 }}>Xem theo:</span>
                <Select value={filterType} onChange={(val) => setFilterType(val)} style={{ width: 200 }}>
                    <Option value="day">Theo ngày</Option>
                    <Option value="week">Theo tuần</Option>
                    <Option value="month">Theo tháng</Option>
                    <Option value="quarter">Theo quý</Option>
                    <Option value="year">Theo năm</Option>
                </Select>
            </Card>

            {loading ? (
                <Spin size="large" />
            ) : (
                <>
                    <Table
                        columns={columns}
                        dataSource={aggregatedData.map((item, idx) => ({ key: idx, ...item }))}
                        pagination={false}
                    />

                    <Card title="📈 Biểu đồ thu nhập & số lượng bán" style={{ marginTop: 24 }}>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={aggregatedData} margin={{ top: 16, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip formatter={(value: any, name: any) =>
                                    name === 'income'
                                        ? [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Thu nhập']
                                        : [`${value} ly`, 'Số lượng bán']
                                }
                                />

                                <Legend />
                                <Bar yAxisId="left" dataKey="income" fill="#5B8FF9" name="Thu nhập" radius={[6, 6, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="quantity" name="Số lượng bán" stroke="#F6BD16" strokeWidth={2} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card style={{ marginTop: 24 }}>
                        <Statistic title="Tổng thu nhập" value={totalIncome} suffix="₫" valueStyle={{ color: '#3f8600' }} formatter={(val) => Number(val).toLocaleString('vi-VN')} />
                        <br />
                        <Statistic title="Tổng số ly đã bán" value={totalQuantity} suffix="ly" valueStyle={{ color: '#f79e1b' }} />
                    </Card>
                </>
            )}
        </div>
    );
};

export default ManagerIncomeScreen;
