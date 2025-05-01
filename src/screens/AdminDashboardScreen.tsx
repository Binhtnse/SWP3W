/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Table, Typography, Select, Card, Statistic, Spin, message, Image, Row, Col } from 'antd';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

interface TopProduct {
  name: string;
  quantity: number;
  imageUrl: string;
}

const AdminDashboardScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [soldData, setSoldData] = useState<any>(null);
  const [highlightedSegment, setHighlightedSegment] = useState<string | null>(null);

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
      setStats(data); // Save stats data
    } catch (error) {
      console.error("Error fetching top products:", error);
      message.error('Không thể tải dữ liệu sản phẩm');
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

  const fetchSoldData = async () => {
    try {
      const headers = getAuthHeader();
      if (!headers) return;

      const response = await axios.get('https://beautiful-unity-production.up.railway.app/api/v1/dashboard/total-sold', {
        headers,
      });
      const data = response.data;

      setSoldData(data);
    } catch (error) {
      console.error("Error fetching sold data:", error);
      message.error('Không thể tải dữ liệu bán hàng');
    }
  };

  useEffect(() => {
    fetchAggregatedData(filterType);
    fetchTopProducts();
    fetchSoldData();
  }, [filterType]);

  const columns = [
    { title: 'Thời gian', dataIndex: 'period', key: 'period' },
    { title: 'Thu nhập (VND)', dataIndex: 'income', key: 'income', render: (val: number) => val.toLocaleString('vi-VN') + ' ₫' },
  ];

  const chartData = aggregatedData.map((item: any) => ({
    period: formatPeriod(item.orderDate, filterType),
    revenue: item.totalRevenue,
    quantity: item.totalOrders,
  }));

  const pieChartData = [
    { name: 'Sản phẩm đơn', value: soldData?.totalSingleProducts || 0 },
    { name: 'Sản phẩm extra', value: soldData?.totalExtras || 0 },
    { name: 'Sản phẩm combo', value: soldData?.totalCombos || 0 },
  ];
  const COLORS = ['#8884d8', '#82ca9d', '#ffbb28', '#ff8042'];

  const handlePieClick = (data: any, index: number) => {
    setHighlightedSegment(data.name); // Highlight the clicked segment
    console.log(index);
  };

  return (
    <div style={{ padding: 24 }}>


      <div style={{ padding: 24 }}>
        <Title level={2}>📊 Quản lý tổng quan</Title>

        {loading ? (
          <Spin size="large" />
        ) : (
          <Row gutter={16} justify="space-between">
            {/* Tổng số quản lý */}
            <Col span={4}>
              <Card>
                <Statistic
                  title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Tổng số quản lý</span>}
                  value={stats?.totalManager || 0}
                  prefix="👔"
                  valueStyle={{ color: '#3f8600', fontSize: '24px' }}
                />
              </Card>
            </Col>


            {/* Tổng số nhân viên */}
            <Col span={4}>
              <Card>
                <Statistic
                  title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Tổng số nhân viên</span>}
                  value={stats?.totalStaff || 0}
                  prefix="👨‍💻"
                  valueStyle={{ color: '#cf1322', fontSize: '24px' }}
                />
              </Card>
            </Col>


            {/* Tổng số sản phẩm */}
            <Col span={4}>
              <Card>
                <Statistic
                  title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Tổng số sản phẩm</span>}
                  value={stats?.totalProduct || 0}
                  prefix="📦"
                  valueStyle={{ color: '#2f54eb', fontSize: '24px' }}
                />
              </Card>
            </Col>

            {/* Tổng số sản phẩm combo */}
            <Col span={4}>
              <Card>
                <Statistic
                  title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Sản phẩm combo</span>}
                  value={stats?.totalComboProduct || 0}
                  prefix="🛒"
                  valueStyle={{ color: '#f56a00', fontSize: '24px' }}
                />
              </Card>
            </Col>

            {/* Tổng số sản phẩm chính */}
            <Col span={4}>
              <Card>
                <Statistic
                  title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Sản phẩm chính</span>}
                  value={stats?.totalMainProduct || 0}
                  prefix="🏷️"
                  valueStyle={{ color: '#7262fd', fontSize: '24px' }}
                />
              </Card>
            </Col>

            {/* Tổng số sản phẩm extra */}
            <Col span={4}>
              <Card>
                <Statistic
                  title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Sản phẩm extra</span>}
                  value={stats?.totalExtraProduct || 0}
                  prefix="➕"
                  valueStyle={{ color: '#eb2f96', fontSize: '24px' }}
                />
              </Card>
            </Col>
          </Row>
        )}
      </div>

      <Card title="Top 3 Sản Phẩm" style={{ marginBottom: 24, backgroundColor: '#f5f5f5', padding: '16px' }}>
        <Row gutter={[16, 16]}>
          {topProducts.map((item, idx) => (
            <Col key={idx} span={8}>
              <Card hoverable style={{ textAlign: 'center' }}>
                <Image width={250}
                  height={250}
                  style={{ objectFit: 'cover' }}
                  src={item.imageUrl}
                  fallback="fallback-image-url.jpg" />
                <Title level={4}>{item.name}</Title>
                <p>Số lượng bán: {item.quantity}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>


      <Title level={2}>📊 Quản lý thu nhập</Title>
      <Row gutter={16}>
        {/* Total income display on the left */}
        <Col span={12}> {/* Adjust the span to control the width of the total income */}
          <Card style={{ marginBottom: 24 }}>
            <Statistic
              title="Tổng thu nhập"
              value={totalIncome}
              suffix="₫"
              valueStyle={{ color: '#3f8600' }}
              formatter={(val) => Number(val).toLocaleString('vi-VN')}
            />
          </Card>
        </Col>

        {/* Pie chart for total sold products on the right */}
        <Col span={12}> {/* Adjust the span to control the width of the chart */}
          <Card title="Phân phối sản phẩm bán" style={{ backgroundColor: '#f5f5f5', padding: '16px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                  onClick={handlePieClick}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  formatter={(value) => {
                    return highlightedSegment === value ? <strong>{value}</strong> : value;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

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
          <Card style={{ marginBottom: 24 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" /> {/* Mốc thời gian dưới các cột */}
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
  );
};

export default AdminDashboardScreen;
