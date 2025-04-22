/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Table, Typography, Select, Card, Statistic, Spin } from 'antd';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, Legend,
    Cell,
} from 'recharts';
import ManagerLayout from '../components/ManagerLayout'; // Import ManagerLayout

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
    // 10 ngày liên tiếp
    ...Array.from({ length: 10 }).map((_, i) => ({
        id: `DAY${i + 1}`,
        totalAmount: 100000 + i * 50000,
        createdAt: new Date(`2024-04-${i + 1}`),
        items: [{ quantity: 1 + i, unitPrice: 100000 + i * 50000, totalPrice: 100000 + i * 50000 }],
    })),

    // 5 tháng khác nhau
    { id: 'MONTH1', totalAmount: 800000, createdAt: new Date('2024-01-15'), items: [{ quantity: 8, unitPrice: 100000, totalPrice: 800000 }] },
    { id: 'MONTH2', totalAmount: 700000, createdAt: new Date('2024-02-10'), items: [{ quantity: 7, unitPrice: 100000, totalPrice: 700000 }] },
    { id: 'MONTH3', totalAmount: 600000, createdAt: new Date('2024-03-10'), items: [{ quantity: 6, unitPrice: 100000, totalPrice: 600000 }] },
    { id: 'MONTH4', totalAmount: 900000, createdAt: new Date('2024-05-05'), items: [{ quantity: 9, unitPrice: 100000, totalPrice: 900000 }] },
    { id: 'MONTH5', totalAmount: 1000000, createdAt: new Date('2024-06-25'), items: [{ quantity: 10, unitPrice: 100000, totalPrice: 1000000 }] },

    // 4 quý khác nhau
    { id: 'QUARTER1', totalAmount: 850000, createdAt: new Date('2023-01-20'), items: [{ quantity: 8, unitPrice: 106250, totalPrice: 850000 }] },
    { id: 'QUARTER2', totalAmount: 930000, createdAt: new Date('2023-04-12'), items: [{ quantity: 9, unitPrice: 103333, totalPrice: 930000 }] },
    { id: 'QUARTER3', totalAmount: 720000, createdAt: new Date('2023-07-18'), items: [{ quantity: 6, unitPrice: 120000, totalPrice: 720000 }] },
    { id: 'QUARTER4', totalAmount: 660000, createdAt: new Date('2023-10-05'), items: [{ quantity: 6, unitPrice: 110000, totalPrice: 660000 }] },

    // 2 năm khác nhau
    { id: 'YEAR1', totalAmount: 1200000, createdAt: new Date('2022-08-08'), items: [{ quantity: 12, unitPrice: 100000, totalPrice: 1200000 }] },
    { id: 'YEAR2', totalAmount: 1400000, createdAt: new Date('2021-09-09'), items: [{ quantity: 14, unitPrice: 100000, totalPrice: 1400000 }] },
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

const COLORS = ['#5B8FF9', '#61DDAA', '#65789B', '#F6BD16', '#7262fd', '#78D3F8', '#9661BC', '#F6903D'];

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
        <ManagerLayout> {/* Bao bọc trang trong ManagerLayout */}
            <div style={{ padding: 24 }}>
                {/* Đưa phần thống kê lên đầu trang */}
                <Title level={2}>📊 Quản lý thu nhập & sản phẩm đã bán</Title>

                <Card style={{ marginBottom: 24 }}>
                    <Statistic title="Tổng thu nhập" value={totalIncome} suffix="₫" valueStyle={{ color: '#3f8600' }} formatter={(val) => Number(val).toLocaleString('vi-VN')} />
                    <Statistic title="Tổng số ly đã bán" value={totalQuantity} suffix="ly" valueStyle={{ color: '#f79e1b' }} />
                </Card>

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
                                            : [`${value} VNĐ`, 'Thu nhập']
                                    }
                                    />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="income" name="Thu nhập" radius={[6, 6, 0, 0]}>
                                        {
                                            aggregatedData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))
                                        }
                                    </Bar>
                                    <Line yAxisId="right" type="monotone" dataKey="quantity" name="Số lượng bán" stroke="#F6BD16" strokeWidth={2} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>

                    </>
                )}
            </div>
        </ManagerLayout>
    );
};

export default ManagerIncomeScreen;
